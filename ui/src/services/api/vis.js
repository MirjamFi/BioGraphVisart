import http from '../../utils/http';
import api from './config';

export const postVis = async (data) => {
  const url = `${api.root}/vis`
  return http.post(url, { data });
};

export const putVis = async (id, data) => {
  const url = `${api.root}/vis/${id}`
  return http.put(url, { data });
};

export const getVis = async (id=null) => {
  let url = `${api.root}/vis`;
  if (id) {
    url += `/${id}`;
  }
  return http.get(url);
}

export default {
  post: postVis,
  put: putVis,
  get: getVis,
};
