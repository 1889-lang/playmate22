const fs = require('fs');

let tCode = fs.readFileSync('miniprogram/data/themes.ts', 'utf8');
tCode = tCode.replace(/export interface[\s\S]*?\n\}/g, '');
tCode = tCode.replace(/if \(typeof module[\s\S]*/g, '');
tCode = tCode.replace(/export const THEMES: Theme\[\] =/, 'var THEMES =');
tCode = tCode.replace(/export const THEME_RELATIONS: ThemeActivityRelation\[\] =/, 'var THEME_RELATIONS =');

let aCode = fs.readFileSync('miniprogram/data/activities.ts', 'utf8');
aCode = aCode.replace(/import .*/g, '');
aCode = aCode.replace(/export const INITIAL_ACTIVITIES: Activity\[\] =/, 'var INITIAL_ACTIVITIES =');
aCode = aCode.replace(/export const ACTIVITIES = INITIAL_ACTIVITIES;/, '');

eval(tCode + '\n' + aCode);

console.log('=== 微信小程序「精选主题」静态数据与过滤逻辑校验 ===');
console.log('主题总数:', THEMES.length);

THEMES.forEach(theme => {
  const relations = THEME_RELATIONS.filter(r => r.themeId === theme.id);
  const approvedActs = relations.map(rel => {
    const act = INITIAL_ACTIVITIES.find(a => a.id === rel.activityId);
    if (!act) return { id: rel.activityId, status: 'NOT_FOUND' };
    return {
      id: act.id,
      title: act.title,
      isReviewed: act.isReviewed,
      reviewStatus: act.reviewStatus,
      roleTag: rel.roleTag
    };
  });

  const approvedOnly = approvedActs.filter(a => a.isReviewed === true && a.reviewStatus === 'approved');

  console.log('\n----------------------------------------');
  console.log('主题 ID:', theme.id);
  console.log('主题名称:', theme.title);
  console.log('总结适龄:', theme.ageRange);
  console.log('关联配置数:', relations.length);
  console.log('动态计算渲染数:', approvedOnly.length);
  console.log('实际能展示的已审核玩法:');
  approvedOnly.forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.id}] ${a.title} (${a.roleTag})`);
  });
});
