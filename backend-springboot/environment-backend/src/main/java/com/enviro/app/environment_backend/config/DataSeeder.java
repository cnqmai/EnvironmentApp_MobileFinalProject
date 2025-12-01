package com.enviro.app.environment_backend.config;

import com.enviro.app.environment_backend.model.ArticleType;
import com.enviro.app.environment_backend.model.KnowledgeArticle;
import com.enviro.app.environment_backend.repository.KnowledgeArticleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final KnowledgeArticleRepository knowledgeArticleRepository;

    public DataSeeder(KnowledgeArticleRepository knowledgeArticleRepository) {
        this.knowledgeArticleRepository = knowledgeArticleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Chỉ nạp dữ liệu nếu bảng đang trống
        if (knowledgeArticleRepository.count() == 0) {
            System.out.println(">>> [DataSeeder] Đang khởi tạo dữ liệu VIDEO mẫu...");

            List<KnowledgeArticle> articles = Arrays.asList(
                // 1. Phân loại rác (Giữ nguyên - Video VTV24 chuẩn)
                KnowledgeArticle.builder()
                    .title("Hướng dẫn phân loại rác tại nguồn đúng cách")
                    .content("Video chi tiết từ VTV24 hướng dẫn người dân cách phân loại rác vô cơ, hữu cơ và tái chế ngay tại nhà. Hành động nhỏ nhưng ý nghĩa lớn.")
                    .type(ArticleType.VIDEO)
                    .thumbnailUrl("https://i.ytimg.com/vi/fYRzg6nYLEc/hqdefault.jpg")
                    .videoUrl("https://www.youtube.com/watch?v=fYRzg6nYLEc")
                    .authorName("VTV24")
                    .category("PHAN_LOAI")
                    .viewCount(15400)
                    .isPublished(true)
                    .build(),

                // 2. Tái chế chai nhựa (Giữ nguyên - Video Mẹo vặt hay)
                KnowledgeArticle.builder()
                    .title("5 Ý tưởng tái chế chai nhựa thành vật dụng hữu ích")
                    .content("Hô biến những chai nhựa bỏ đi thành chậu cây, hộp bút và nhiều vật dụng trang trí độc đáo cho góc học tập của bạn.")
                    .type(ArticleType.VIDEO)
                    .thumbnailUrl("https://i.ytimg.com/vi/FOcCorkFkS4/hqdefault.jpg")
                    .videoUrl("https://www.youtube.com/watch?v=FOcCorkFkS4")
                    .authorName("Mẹo Vặt")
                    .category("TAI_CHE")
                    .viewCount(8100)
                    .isPublished(true)
                    .build(),

                // 3. [MỚI] Video về Túi Nilon (Thay cho bài Sống xanh cũ)
                KnowledgeArticle.builder()
                    .title("Báo động: Mỗi gia đình Việt xả ra 1kg túi nilon/tháng")
                    .content("Thói quen sử dụng túi nilon tràn lan đang gây áp lực khủng khiếp lên môi trường. Video này sẽ giúp bạn nhận ra tác hại thực sự và cách thay đổi thói quen mua sắm.")
                    .type(ArticleType.VIDEO)
                    .thumbnailUrl("https://i.ytimg.com/vi/Fiely2m_4pk/hqdefault.jpg")
                    .videoUrl("https://www.youtube.com/watch?v=Fiely2m_4pk") // Link VTV24: Mỗi gia đình 1kg nilon
                    .authorName("VTV24")
                    .category("GIAM_RAC")
                    .viewCount(4500)
                    .isPublished(true)
                    .build(),

                // 4. [MỚI] Video về Rác thải điện tử/Pin (Thay cho bài Pin cũ)
                KnowledgeArticle.builder()
                    .title("Hiểm họa khôn lường từ rác thải điện tử và pin")
                    .content("Rác thải điện tử chứa nhiều kim loại nặng độc hại như chì, thủy ngân. Việc xử lý và tái chế bừa bãi không chỉ gây ô nhiễm đất, nước mà còn ảnh hưởng trực tiếp đến sức khỏe con người.")
                    .type(ArticleType.VIDEO)
                    .thumbnailUrl("https://i.ytimg.com/vi/6RGo590Fm6c/hqdefault.jpg")
                    .videoUrl("https://www.youtube.com/watch?v=6RGo590Fm6c") // Link VTV24: Tái chế rác điện tử
                    .authorName("VTV24")
                    .category("PHAN_LOAI")
                    .viewCount(2100)
                    .isPublished(true)
                    .build()
            );

            knowledgeArticleRepository.saveAll(articles);
            System.out.println(">>> [DataSeeder] Đã cập nhật 4 Video mẫu mới thành công!");
        }
    }
}