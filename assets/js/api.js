const loom_api = {
    message_send: '/message/send/',
    message_unarchive: '/profile/messages/unarchive/',
    message_archive: '/profile/messages/archive/',
    message_bookmark: '/profile/messages/bookmark/',
    message_unbookmark: '/profile/messages/unbookmark/',
    billing: '/api/billing/',
    company: '/api/company/',
    creditcard: '/api/creditcard/',
    documentDetails: '/api/project/%(projectID)s/job/%(jobID)s/document/%(documentID)s/',
    job: '/api/jobs/',
    messages: '/api/messages/',
    onboard: '/api/onboard/',
    order: '/api/orders/',
    profile: '/api/profile/',
    review: '/api/review/',
    skills: '/api/skills/',
    terms: '/api/terms/',
    project: '/api/project/'

};

module.exports = loom_api;
