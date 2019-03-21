import api from './config';

export const postVis = async (data) => {
  setTimeout(
    () => console.log(`POST ${api.root}/vis`),
    2000,
  );
};

export const getVis = async (id) => {
  setTimeout(
    () => console.log(`GET ${api.root}/${id}`),
    2000,
  );
}

export default {
  post: postVis,
  get: getVis,
};
