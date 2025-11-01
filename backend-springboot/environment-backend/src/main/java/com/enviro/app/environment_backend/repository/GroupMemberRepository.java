package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.CommunityGroup;
import com.enviro.app.environment_backend.model.GroupMember;
import com.enviro.app.environment_backend.model.GroupMemberId;
import com.enviro.app.environment_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    
    List<GroupMember> findByGroupOrderByJoinedAtDesc(CommunityGroup group);
    
    List<GroupMember> findByUserOrderByJoinedAtDesc(User user);
    
    boolean existsByUserAndGroup(User user, CommunityGroup group);
    
    Optional<GroupMember> findByUserAndGroup(User user, CommunityGroup group);
}

