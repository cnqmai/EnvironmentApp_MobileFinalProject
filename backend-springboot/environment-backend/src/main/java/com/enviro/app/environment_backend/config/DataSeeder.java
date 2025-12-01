package com.enviro.app.environment_backend.config;

import com.enviro.app.environment_backend.model.ArticleType;
import com.enviro.app.environment_backend.model.KnowledgeArticle;
import com.enviro.app.environment_backend.model.Reward;
import com.enviro.app.environment_backend.model.RewardType;
// THÊM ENTITY VÀ REPOSITORY MỚI
import com.enviro.app.environment_backend.model.Quiz;
import com.enviro.app.environment_backend.model.QuizQuestion;
import com.enviro.app.environment_backend.model.DailyTip;
import com.enviro.app.environment_backend.repository.DailyTipRepository;
import com.enviro.app.environment_backend.repository.QuizRepository;
import com.enviro.app.environment_backend.repository.QuizQuestionRepository;
import com.enviro.app.environment_backend.repository.KnowledgeArticleRepository;
import com.enviro.app.environment_backend.repository.RewardRepository;

import jakarta.transaction.Transactional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class DataSeeder implements CommandLineRunner {

    private final KnowledgeArticleRepository knowledgeArticleRepository;
    private final RewardRepository rewardRepository;
    private final QuizRepository quizRepository; 
    private final DailyTipRepository dailyTipRepository; 
    private final QuizQuestionRepository quizQuestionRepository; 


    public DataSeeder(
        KnowledgeArticleRepository knowledgeArticleRepository, 
        RewardRepository rewardRepository,
        QuizRepository quizRepository, 
        DailyTipRepository dailyTipRepository,
        QuizQuestionRepository quizQuestionRepository 
    ) {
        this.knowledgeArticleRepository = knowledgeArticleRepository;
        this.rewardRepository = rewardRepository;
        this.quizRepository = quizRepository; 
        this.dailyTipRepository = dailyTipRepository; 
        this.quizQuestionRepository = quizQuestionRepository; 
    }

    @Override
    public void run(String... args) throws Exception {
        seedKnowledgeArticles();
        seedRewards();
        seedQuizzes(); 
        seedDailyTips(); 
    }
    
    // ----------------------------------------------------
    // --- BỔ SUNG LOGIC SEEDING CHO QUIZ VÀ DAILY TIP ---
    // ----------------------------------------------------
    
    @Transactional
    private void seedQuizzes() {
        //if (quizRepository.count() == 0) {
            System.out.println(">>> [DataSeeder] Đang khởi tạo 2 QUIZ mẫu...");

            List<Quiz> quizzes = Arrays.asList(
                Quiz.builder()
                    .title("Kiến thức cơ bản về Tái chế")
                    .description("Kiểm tra sự hiểu biết của bạn về các loại vật liệu tái chế phổ biến và quy trình xử lý.")
                    .difficulty("EASY")
                    .timeLimitMinutes(5)
                    .isActive(true)
                    .build(),
                
                Quiz.builder()
                    .title("Thử thách: Rác thải nguy hại")
                    .description("Bạn có biết cách phân loại các loại rác thải nguy hại như pin, bóng đèn, hóa chất?")
                    .difficulty("MEDIUM")
                    .timeLimitMinutes(8)
                    .isActive(true)
                    .build()
            );
            
            // 1. LƯU QUIZ TRƯỚC ĐỂ CÓ ID LIÊN KẾT
            List<Quiz> savedQuizzes = quizRepository.saveAll(quizzes); 
            
            // 2. TẠO QUESTIONS CHO QUIZ THỨ NHẤT
            Quiz quiz1 = savedQuizzes.get(0); 
            
            List<QuizQuestion> questions1 = Arrays.asList(
                QuizQuestion.builder()
                    .quiz(quiz1)
                    .questionText("Vật liệu nào sau đây là rác thải hữu cơ?")
                    .optionA("Vỏ chuối, rau củ hỏng")
                    .optionB("Chai nhựa PET")
                    .optionC("Giấy báo cũ")
                    .optionD("Túi nilon")
                    // SỬA LỖI: Dùng correctAnswer và giá trị là ký tự chữ cái (A, B, C, D)
                    .correctAnswer("A") 
                    .orderNumber(1)
                    .build(),
                    
                QuizQuestion.builder()
                    .quiz(quiz1)
                    .questionText("Màu sắc thùng rác thường dùng cho rác tái chế là gì?")
                    .optionA("Xanh lá")
                    .optionB("Xanh dương") 
                    .optionC("Vàng") 
                    .optionD("Đỏ")
                    // SỬA LỖI: Dùng correctAnswer và giá trị là ký tự chữ cái (B)
                    .correctAnswer("B") 
                    .orderNumber(2)
                    .build(),

                QuizQuestion.builder()
                    .quiz(quiz1)
                    .questionText("Đồ điện tử (E-waste) nên được xử lý như thế nào?")
                    .optionA("Vứt vào thùng rác thường")
                    .optionB("Đốt để lấy kim loại")
                    .optionC("Thu gom tại điểm chuyên dụng") 
                    .optionD("Chôn lấp")
                    // SỬA LỖI: Dùng correctAnswer và giá trị là ký tự chữ cái (C)
                    .correctAnswer("C") 
                    .orderNumber(3)
                    .build()
            );

            // 3. TẠO QUESTIONS CHO QUIZ THỨ HAI
            Quiz quiz2 = savedQuizzes.get(1); 
            
            List<QuizQuestion> questions2 = Arrays.asList(
                QuizQuestion.builder()
                    .quiz(quiz2)
                    .questionText("Pin tiểu (AA, AAA) được phân loại là rác gì?")
                    .optionA("Rác tái chế")
                    .optionB("Rác thải nguy hại") 
                    .optionC("Rác hữu cơ")
                    .optionD("Rác thải thông thường")
                    // SỬA LỖI: Dùng correctAnswer và giá trị là ký tự chữ cái (B)
                    .correctAnswer("B") 
                    .orderNumber(1)
                    .build(),
                
                QuizQuestion.builder()
                    .quiz(quiz2)
                    .questionText("Lốp xe cũ có thể được tái chế thành sản phẩm nào?")
                    .optionA("Đồ nội thất")
                    .optionB("Gạch lát sân")
                    .optionC("Cả hai đáp án trên") 
                    .optionD("Không thể tái chế")
                    // SỬA LỖI: Dùng correctAnswer và giá trị là ký tự chữ cái (C)
                    .correctAnswer("C") 
                    .orderNumber(2)
                    .build()
            );
            
            // 4. LƯU TẤT CẢ CÂU HỎI
            quizQuestionRepository.saveAll(questions1);
            quizQuestionRepository.saveAll(questions2);
            
            System.out.println(">>> [DataSeeder] Đã nạp thành công Quiz và Questions!");
        //}
    }
    
    private void seedDailyTips() {
        if (dailyTipRepository.count() == 0) {
            System.out.println(">>> [DataSeeder] Đang khởi tạo 3 DAILY TIP mẫu...");
            
            OffsetDateTime now = OffsetDateTime.now();

            List<DailyTip> tips = Arrays.asList(
                DailyTip.builder()
                    .title("Mẹo đi chợ xanh")
                    .description("Luôn mang theo túi vải của mình khi đi siêu thị hoặc chợ để từ chối túi nilon.")
                    .category("GIAM_RAC")
                    .pointsReward(5)
                    .iconUrl("shopping-outline") 
                    .displayDate(now.toLocalDate()) 
                    .isActive(true)
                    .actionText("Tôi đã mang túi!")
                    .build(),

                DailyTip.builder()
                    .title("Tái chế hữu cơ")
                    .description("Sử dụng rác thải thực phẩm làm phân bón cho cây cảnh hoặc vườn rau nhỏ của gia đình bạn.")
                    .category("TAI_CHE")
                    .pointsReward(10)
                    .iconUrl("recycle") 
                    .displayDate(now.minus(1, ChronoUnit.DAYS).toLocalDate())
                    .isActive(true)
                    .actionText("Tôi đã ủ phân.")
                    .build(),
                    
                DailyTip.builder()
                    .title("Tiết kiệm điện nước")
                    .description("Rút phích cắm các thiết bị điện tử khi không sử dụng (chế độ chờ cũng tiêu thụ điện).")
                    .category("TIET_KIEM")
                    .pointsReward(3)
                    .iconUrl("power-off") 
                    .displayDate(now.minus(2, ChronoUnit.DAYS).toLocalDate())
                    .isActive(true)
                    .actionText("Tôi đã rút phích.")
                    .build()
            );

            dailyTipRepository.saveAll(tips);
            System.out.println(">>> [DataSeeder] Đã nạp thành công 3 Daily Tip mẫu!");
        }
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

                // 2. Túi vải 
                Reward.builder()
                    .name("Túi vải Canvas Môi trường")
                    .description("Túi tote vải canvas thời trang, bền đẹp. Hãy dùng túi này thay cho túi nilon khi đi siêu thị nhé!")
                    .pointsCost(300)
                    .imageUrl("https://img.freepik.com/premium-vector/eco-bag-cloth-bag-vector-illustration-isolated-white-background_106368-232.jpg")
                    .type(RewardType.MERCHANDISE) 
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
                    .quantityAvailable(-1) 
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