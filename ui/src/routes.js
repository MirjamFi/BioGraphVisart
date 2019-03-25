import route from './utils/routing';

export const homeRoute = route('/home');
export const viewerRoute = route('/viewer');
export const visTableRoute = route('/visualizations');

export default {
  home: homeRoute,
  viewer: viewerRoute,
  visTable: visTableRoute,
};
