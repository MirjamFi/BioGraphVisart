import { PUBLIC_PATH } from '../config';

const ROUTE_PREFIX = PUBLIC_PATH === '/' ? '' : PUBLIC_PATH;

const route = (path) => `${ROUTE_PREFIX}${path}`;

export default route;
