package com.enviro.app.environment_backend.config;

import com.enviro.app.environment_backend.model.ArticleType;
import com.enviro.app.environment_backend.model.KnowledgeArticle;
import com.enviro.app.environment_backend.model.Reward;
import com.enviro.app.environment_backend.model.RewardType;
import com.enviro.app.environment_backend.repository.KnowledgeArticleRepository;
import com.enviro.app.environment_backend.repository.RewardRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final KnowledgeArticleRepository knowledgeArticleRepository;
    private final RewardRepository rewardRepository;

    public DataSeeder(KnowledgeArticleRepository knowledgeArticleRepository, RewardRepository rewardRepository) {
        this.knowledgeArticleRepository = knowledgeArticleRepository;
        this.rewardRepository = rewardRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedKnowledgeArticles();
        seedRewards();
    }

    private void seedKnowledgeArticles() {
        if (knowledgeArticleRepository.count() == 0) {
            System.out.println(">>> [DataSeeder] Đang khởi tạo dữ liệu VIDEO mẫu...");
            
            List<KnowledgeArticle> articles = Arrays.asList(
                KnowledgeArticle.builder()
                    .title("Hướng dẫn phân loại rác tại nguồn đúng cách")
                    .content("Video chi tiết từ VTV24 hướng dẫn người dân cách phân loại rác vô cơ, hữu cơ và tái chế ngay tại nhà.")
                    .type(ArticleType.VIDEO)
                    .thumbnailUrl("https://i.ytimg.com/vi/fYRzg6nYLEc/hqdefault.jpg")
                    .videoUrl("https://www.youtube.com/watch?v=fYRzg6nYLEc")
                    .authorName("VTV24")
                    .category("PHAN_LOAI")
                    .viewCount(15400)
                    .isPublished(true)
                    .build(),
                
                KnowledgeArticle.builder()
                    .title("5 Ý tưởng tái chế chai nhựa thành vật dụng hữu ích")
                    .content("Hô biến những chai nhựa bỏ đi thành chậu cây, hộp bút và nhiều vật dụng trang trí độc đáo.")
                    .type(ArticleType.VIDEO)
                    .thumbnailUrl("https://i.ytimg.com/vi/FOcCorkFkS4/hqdefault.jpg")
                    .videoUrl("https://www.youtube.com/watch?v=FOcCorkFkS4")
                    .authorName("Mẹo Vặt")
                    .category("TAI_CHE")
                    .viewCount(8100)
                    .isPublished(true)
                    .build(),

                KnowledgeArticle.builder()
                    .title("Báo động: Mỗi gia đình Việt xả ra 1kg túi nilon/tháng")
                    .content("Thói quen sử dụng túi nilon tràn lan đang gây áp lực khủng khiếp lên môi trường. Video này sẽ giúp bạn nhận ra tác hại thực sự.")
                    .type(ArticleType.VIDEO)
                    .thumbnailUrl("https://i.ytimg.com/vi/Fiely2m_4pk/hqdefault.jpg")
                    .videoUrl("https://www.youtube.com/watch?v=Fiely2m_4pk")
                    .authorName("VTV24")
                    .category("GIAM_RAC")
                    .viewCount(4500)
                    .isPublished(true)
                    .build(),

                KnowledgeArticle.builder()
                    .title("Hiểm họa khôn lường từ rác thải điện tử và pin")
                    .content("Rác thải điện tử chứa nhiều kim loại nặng độc hại. Việc xử lý bừa bãi gây ô nhiễm đất và nước nghiêm trọng.")
                    .type(ArticleType.VIDEO)
                    .thumbnailUrl("https://i.ytimg.com/vi/6RGo590Fm6c/hqdefault.jpg")
                    .videoUrl("https://www.youtube.com/watch?v=6RGo590Fm6c")
                    .authorName("VTV24")
                    .category("PHAN_LOAI")
                    .viewCount(2100)
                    .isPublished(true)
                    .build()
            );

            knowledgeArticleRepository.saveAll(articles);
            System.out.println(">>> [DataSeeder] Đã nạp thành công 4 Video mẫu!");
        }
    }

    private void seedRewards() {
        if (rewardRepository.count() == 0) {
            System.out.println(">>> [DataSeeder] Đang khởi tạo dữ liệu QUÀ TẶNG mẫu...");

            List<Reward> rewards = Arrays.asList(
                // 1. Voucher GotIt
                Reward.builder()
                    .name("Voucher GotIt 50.000đ")
                    .description("Voucher mua sắm đa năng, áp dụng tại hơn 100 thương hiệu ăn uống, mua sắm, giải trí trên toàn quốc.")
                    .pointsCost(500)
                    .imageUrl("https://img.freepik.com/premium-vector/coupon-vector-voucher-gift-card-design-template-promo-code-ticket_106206-1929.jpg")
                    .type(RewardType.VOUCHER)
                    .quantityAvailable(100)
                    .isActive(true)
                    .expiryDate(LocalDate.now().plusMonths(6))
                    .build(),

                // 2. Túi vải (Sửa loại thành MERCHANDISE)
                Reward.builder()
                    .name("Túi vải Canvas Môi trường")
                    .description("Túi tote vải canvas thời trang, bền đẹp. Hãy dùng túi này thay cho túi nilon khi đi siêu thị nhé!")
                    .pointsCost(300)
                    .imageUrl("https://img.freepik.com/premium-vector/eco-bag-cloth-bag-vector-illustration-isolated-white-background_106368-232.jpg")
                    .type(RewardType.MERCHANDISE) // Quan trọng: Khớp với Enum Java
                    .quantityAvailable(50)
                    .isActive(true)
                    .build(),

                // 3. Ống hút tre
                Reward.builder()
                    .name("Bộ ống hút tre tự nhiên")
                    .description("Bộ sản phẩm gồm 02 ống hút tre và 01 cọ rửa chuyên dụng. Sản phẩm an toàn, có thể tái sử dụng nhiều lần.")
                    .pointsCost(200)
                    .imageUrl("https://m.media-amazon.com/images/I/71w-7wK5cWL.jpg")
                    .type(RewardType.MERCHANDISE)
                    .quantityAvailable(200)
                    .isActive(true)
                    .build(),

                // 4. Trồng cây
                Reward.builder()
                    .name("Quyên góp trồng 1 Cây xanh")
                    .description("Đổi 1000 điểm của bạn để đóng góp trồng một cây xanh tại rừng phòng hộ. Bạn sẽ nhận được giấy chứng nhận điện tử.")
                    .pointsCost(1000)
                    .imageUrl("https://img.freepik.com/premium-vector/planting-tree-vector-illustration_106368-233.jpg")
                    .type(RewardType.TREE)
                    .quantityAvailable(-1) // Không giới hạn
                    .isActive(true)
                    .build(),

                // 5. Bình giữ nhiệt
                Reward.builder()
                    .name("Bình giữ nhiệt Vỏ Tre 500ml")
                    .description("Bình giữ nhiệt lõi inox 304, vỏ tre ép sang trọng. Giữ nhiệt nóng/lạnh lên tới 12h.")
                    .pointsCost(1500)
                    .imageUrl("https://m.media-amazon.com/images/I/61+y+K+k+L._AC_SL1500_.jpg")
                    .type(RewardType.MERCHANDISE)
                    .quantityAvailable(20)
                    .isActive(true)
                    .build()
            );

            rewardRepository.saveAll(rewards);
            System.out.println(">>> [DataSeeder] Đã nạp thành công 5 Quà tặng mẫu!");
        }
    }
}