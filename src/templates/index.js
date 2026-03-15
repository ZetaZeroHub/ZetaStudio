import shooterTemplate from './shooter';
import platformerTemplate from './platformer';
import quizTemplate from './quiz';
import galgameTemplate from './galgame';
import cube3dTemplate from './cube3d';
import solar3dTemplate from './solar3d';
import fps3dTemplate from './fps3d';
import { kidsTemplateList } from './kidsTemplates';

export const templates = {
  shooter: shooterTemplate,
  platformer: platformerTemplate,
  quiz: quizTemplate,
  galgame: galgameTemplate,
  cube3d: cube3dTemplate,
  solar3d: solar3dTemplate,
  fps3d: fps3dTemplate,
};

// Register kids templates into the unified registry
kidsTemplateList.forEach(t => {
  templates[t.templateType] = t;
});

export function getTemplate(type) {
  return templates[type] || null;
}

export function getAllTemplates() {
  // Pro mode: only non-kids templates
  return Object.values(templates).filter(t => !t.category);
}

export function getKidsTemplates() {
  return kidsTemplateList;
}
