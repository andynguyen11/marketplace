const loom_api = {
  message_send: '/message/send/',
  message_unarchive: '/profile/messages/unarchive/',
  message_archive: '/profile/messages/archive/',
  message_bookmark: '/profile/messages/bookmark/',
  message_unbookmark: '/profile/messages/unbookmark/',
  billing: '/api/billing/',
  company: '/api/company/',
  creditcard: '/api/creditcard/',
  documentDetails: (project, job, document) => `/api/project/${project}/job/${job}/document/${document}/`,
  job: '/api/jobs/',
  messages: '/api/messages/',
  message: '/api/message/',
  messagePoller: '/api/thread/',
  onboard: '/api/onboard/',
  order: '/api/orders/',
  profile: '/api/profile/',
  promo: '/api/promo/',
  review: '/api/review/',
  skills: '/api/skills/',
  terms: '/api/terms/',
  termsAgree: '/api/terms/agree/',
  project: '/api/project/',
  projectUrl: slug => `/project/${slug}/`
};

module.exports = loom_api;
