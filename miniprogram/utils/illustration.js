// 根据活动专属 ID 或分类匹配精准插画
function getIllustration(activity) {
  if (!activity) return '';

  // 1. 寻找躲猫猫专属手绘封面（带视觉互动的真实手绘图）
  if (activity.id === 'act-05' || activity.title.includes('躲猫猫')) {
    return '/assets/images/seek_hide_seek_detail_1793840598398.jpg';
  }

  // 2. 俯卧爬行/大运动相关专属手绘插画
  if (activity.id === 'act-02' || activity.title.includes('小飞机') || activity.category === '大运动') {
    return '/assets/images/seek_hide_seek_detail_1793840108536.jpg';
  }

  // 3. 其他分类若暂时共用，优先按分类主题语义分配
  if (activity.category === '精细动作' || activity.category === '感官认知') {
    return '/assets/images/seek_hide_seek_detail_1793840598398.jpg';
  }

  return '/assets/images/seek_hide_seek_detail_1793840108536.jpg';
}

module.exports = {
  getIllustration
};
