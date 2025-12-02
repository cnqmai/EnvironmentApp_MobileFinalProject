package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.CommunityGroupResponse;
import com.enviro.app.environment_backend.dto.CreateGroupRequest;
import com.enviro.app.environment_backend.model.CommunityGroup;
import com.enviro.app.environment_backend.model.GroupMember;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.CommunityGroupRepository;
import com.enviro.app.environment_backend.repository.GroupMemberRepository;
import com.enviro.app.environment_backend.repository.UserRepository; // Import mới
import com.enviro.app.environment_backend.repository.ReportRepository;
import com.enviro.app.environment_backend.repository.PostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommunityGroupService {

    private final CommunityGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository; // Inject User Repo
    private final BadgeService badgeService;     // Inject Badge Service
    private final ReportRepository reportRepository; // Inject Report Repository
    private final PostRepository postRepository;     // Inject Post Repository

    // Cập nhật Constructor để inject thêm UserRepository, BadgeService, ReportRepository và PostRepository
    public CommunityGroupService(CommunityGroupRepository groupRepository,
                                GroupMemberRepository memberRepository,
                                UserRepository userRepository,
                                BadgeService badgeService,
                                ReportRepository reportRepository,
                                PostRepository postRepository) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.badgeService = badgeService;
        this.reportRepository = reportRepository;
        this.postRepository = postRepository;
    }

    public List<CommunityGroupResponse> getAllGroups(User currentUser) {
        List<CommunityGroup> groups = groupRepository.findByIsPublicTrueOrderByCreatedAtDesc();
        return groups.stream()
                .map(group -> mapToResponse(group, currentUser))
                .collect(Collectors.toList());
    }

    public CommunityGroupResponse getGroupById(UUID groupId, User currentUser) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm"));
        
        return mapToResponse(group, currentUser);
    }

    @Transactional
    public CommunityGroupResponse createGroup(User creator, CreateGroupRequest request) {
        CommunityGroup group = CommunityGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .areaType(request.getAreaType())
                .areaName(request.getAreaName())
                .creator(creator)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .memberCount(1)
                .imageUrl(request.getImageUrl()) // [CẬP NHẬT] Lấy imageUrl từ request và lưu
                .build();

        CommunityGroup saved = groupRepository.save(group);

        // Thêm creator làm admin
        GroupMember admin = GroupMember.builder()
                .user(creator)
                .group(saved)
                .role("admin")
                .build();
        memberRepository.save(admin);

        return mapToResponse(saved, creator);
    }

    @Transactional
    public CommunityGroupResponse joinGroup(UUID groupId, User user) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm"));

        if (memberRepository.existsByUserAndGroup(user, group)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn đã tham gia nhóm này rồi");
        }

        // 1. Thêm thành viên
        GroupMember member = GroupMember.builder()
                .user(user)
                .group(group)
                .role("member")
                .build();
        memberRepository.save(member);

        group.setMemberCount(group.getMemberCount() + 1);
        groupRepository.save(group);

        // 2. [GAMIFICATION] Cộng điểm thưởng khi tham gia nhóm (Ví dụ: 50 điểm)
        int pointsReward = 50;
        user.setPoints(user.getPoints() + pointsReward);
        User updatedUser = userRepository.save(user);

        // 3. [GAMIFICATION] Kiểm tra thăng cấp Huy hiệu ngay lập tức
        badgeService.checkAndAssignBadges(updatedUser);

        return mapToResponse(group, user);
    }

    @Transactional
    public void leaveGroup(UUID groupId, User user) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm"));

        Optional<GroupMember> member = memberRepository.findByUserAndGroup(user, group);
        if (member.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn chưa tham gia nhóm này");
        }

        memberRepository.delete(member.get());
        group.setMemberCount(group.getMemberCount() - 1);
        groupRepository.save(group);
    }

    private CommunityGroupResponse mapToResponse(CommunityGroup group, User currentUser) {
        boolean isMember = memberRepository.existsByUserAndGroup(currentUser, group);
        String role = null;
        if (isMember) {
            Optional<GroupMember> member = memberRepository.findByUserAndGroup(currentUser, group);
            role = member.map(GroupMember::getRole).orElse(null);
        }
        
        // --- TÍNH TOÁN THỰC TẾ CHO DASHBOARD (FR-12.1.2) ---
        // Lấy tất cả thành viên trong nhóm
        List<GroupMember> groupMembers = memberRepository.findByGroupOrderByJoinedAtDesc(group);
        
        // Tính tổng số báo cáo vi phạm của tất cả thành viên trong nhóm
        Integer totalReports = groupMembers.stream()
                .mapToInt(member -> (int) reportRepository.countByUser(member.getUser()))
                .sum();
        
        // Tính tổng số posts của các thành viên trong nhóm
        // Lượng rác tái chế = số lượng bài viết * 10 (kg)
        long totalPosts = groupMembers.stream()
                .mapToLong(member -> postRepository.findByUserIdOrderByCreatedAtDesc(member.getUser().getId()).size())
                .sum();
        Double recycledWasteKg = (double) (totalPosts * 10);
        // --------------------------------------------------------

        return CommunityGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .areaType(group.getAreaType())
                .areaName(group.getAreaName())
                .creatorId(group.getCreator().getId())
                .creatorName(group.getCreator().getFullName())
                .isPublic(group.getIsPublic())
                .memberCount(group.getMemberCount())
                .isMember(isMember)
                .role(role)
                .createdAt(group.getCreatedAt())
                // Ánh xạ dữ liệu Dashboard thực tế
                .totalReports(totalReports)
                .recycledWasteKg(recycledWasteKg)
                .imageUrl(group.getImageUrl()) // [CẬP NHẬT] Ánh xạ imageUrl
                .build();
    }
}