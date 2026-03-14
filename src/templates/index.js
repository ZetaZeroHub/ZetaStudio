import shooterTemplate from './shooter';
import platformerTemplate from './platformer';
import quizTemplate from './quiz';
import galgameTemplate from './galgame';
import cube3dTemplate from './cube3d';
import solar3dTemplate from './solar3d';
import fps3dTemplate from './fps3d';

export const templates = {
  shooter: shooterTemplate,
  platformer: platformerTemplate,
  quiz: quizTemplate,
  galgame: galgameTemplate,
  cube3d: cube3dTemplate,
  solar3d: solar3dTemplate,
  fps3d: fps3dTemplate,
};

export function getTemplate(type) {
  return templates[type] || null;
}

export function getAllTemplates() {
  return Object.values(templates);
}
