export interface SlideItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export const ONBOARDING_SLIDES: SlideItem[] = [
  {
    id: '1',
    title: 'Theo dõi chất lượng không khí',
    description: 'Nhận chỉ số AQI theo thời gian thực để bảo vệ sức khỏe gia đình.',
    image: 'https://img.icons8.com/ios/100/null/sun--v1.png',
  },
  {
    id: '2',
    title: 'Xử lý rác đúng cách',
    description: 'Hướng dẫn phân loại và tìm điểm thu gom rác tái chế gần bạn.',
    image: 'https://img.icons8.com/ios/100/null/delete.png',
  },
  {
    id: '3',
    title: 'Chung tay vì môi trường',
    description: 'Báo cáo vi phạm, chia sẻ mẹo xanh và nhận thưởng khi đóng góp.',
    image: 'https://img.icons8.com/ios/100/null/people-working-together.png',
  },
];

export const SOCIAL_ICONS = {
  google: 'https://img.icons8.com/color/48/000000/google-logo.png',
  facebook: 'https://img.icons8.com/fluency/48/000000/facebook-new.png',
};