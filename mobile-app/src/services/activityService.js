import api from './api';

export async function uploadActivity(title, points) {
  const { data } = await api.post('/activities', { title, points });
  return data;
}

export async function listActivities() {
  const { data } = await api.get('/activities');
  return data;
}

export async function getActivity(id) {
  const { data } = await api.get(`/activities/${id}`);
  return data;
}

export async function submitSegmentFeedback(segmentId, isInteresting) {
  const { data } = await api.post(`/segments/${segmentId}/feedback`, {
    isInteresting,
  });
  return data;
}

export async function listSegments() {
  const { data } = await api.get('/segments');
  return data;
}
