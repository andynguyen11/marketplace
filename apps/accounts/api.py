from django.http import HttpResponseForbidden
from django.core.urlresolvers import reverse
from django.contrib.auth import login, authenticate
from rest_condition import Not
from rest_framework import status, generics
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import permission_classes, list_route, detail_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from accounts.models import Profile, Skills, SkillTest, VerificationTest
from accounts.serializers import ProfileSerializer, SkillsSerializer, SkillTestSerializer, VerificationTestSerializer
from apps.api.permissions import IsCurrentUser, IsOwnerOrIsStaff
from generics.tasks import account_confirmation
from generics.viewsets import NestedModelViewSet, CreatorPermissionsMixin
from django.shortcuts import redirect


def nicely_serialize_result(r):
    return {
        'result': r.test_result,
        'percentile': r.percentile,
        'score': r.percentage,
        'time': r.time
    }

def test_url(test, user):
    return '%(url)s?%(query)s' % {
        'url': reverse('api:skilltest-take', kwargs={'profile_pk': user.id}),
        'query': ('expertratings_test=%s' % test.test_id)
    }

def nicely_serialize_skilltest(st, user):
    formatted = {
            'testID': st.test_id,
            'testName': st.test_name,
            'testUrl': test_url(st, user),
            'stats': {
                'questions': st.total_questions,
                'estimated_time': '%d minutes' % st.duration,
                'passing_score': st.passing_marks,
            }}
    results = st.results(user)
    if results:
        formatted['results'] = map(nicely_serialize_result, results)    

    return formatted

def nicely_serialize_verification_tests(verification_tests, user):
    skill_map = {}
    for vt in verification_tests:
        if not skill_map.has_key(vt.skill.id):
            skill_map[vt.skill.id] = {
                    'skillName': vt.skill.name,
                    'tests': [] }
        skill_map[vt.skill.id]['tests'].append(nicely_serialize_skilltest(vt.skilltest, user))
    return [dict(skillId=key, **value) for key, value in skill_map.items()]

class SkillViewSet(ModelViewSet):
    queryset = Skills.objects.all()
    serializer_class = SkillsSerializer

    @permission_classes((IsAdminUser, ))
    def update(self, request, *args, **kwargs):
        return super(SkillViewSet, self).update(request, *args, **kwargs)

    @permission_classes((IsAdminUser, ))
    def partial_update(self, request, *args, **kwargs):
        return super(SkillViewSet, self).partial_update(request, *args, **kwargs)

    @permission_classes((IsAdminUser, ))
    def delete(self, request, *args, **kwargs):
        return super(SkillViewSet, self).delete(request, *args, **kwargs)


class VerificationTestViewSet(NestedModelViewSet):
    queryset = VerificationTest.objects.all()
    serializer_class = VerificationTestSerializer
    parent_key = 'skill'

    @permission_classes((IsAdminUser, ))
    def update(self, request, *args, **kwargs):
        return super(SkillViewSet, self).update(request, *args, **kwargs)

    @permission_classes((IsAdminUser, ))
    def partial_update(self, request, *args, **kwargs):
        return super(SkillViewSet, self).partial_update(request, *args, **kwargs)

    @permission_classes((IsAdminUser, ))
    def delete(self, request, *args, **kwargs):
        return super(SkillViewSet, self).delete(request, *args, **kwargs)


class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def create(self, request, *args, **kwargs):
        password = request.data.pop('password')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.username = user.email
        user.set_password(password[0])
        user.save()
        headers = self.get_success_headers(serializer.data)
        account = authenticate(username=user.email, password=password[0])
        login(request, account)
        return Response(ProfileSerializer(user).data, status=status.HTTP_201_CREATED)

    def public_view(self, profile_dict):
        return { k: v for k, v in profile_dict.items() if k in self.serializer_class.Meta.public_fields }

    def list(self, request, *args, **kwargs):
        response = super(ProfileViewSet, self).list(request, *args, **kwargs)
        response.data = map(self.public_view, response.data)
        return response

    def retrieve(self, request, *args, **kwargs):
        response = super(ProfileViewSet, self).retrieve(request, *args, **kwargs)
        if response.data['id'] != self.request.user.id:
            response.data = self.public_view(response.data)
        return response

    @permission_classes((IsAuthenticated, IsCurrentUser ))
    def update(self, request, *args, **kwargs):
        if request.data.get('signup', None):
            account_confirmation.delay(
                request.user.id,
                request.data.get('role', None)
            )
        return super(ProfileViewSet, self).update(request, *args, **kwargs)

    @permission_classes((IsAuthenticated, IsCurrentUser ))
    def partial_update(self, request, *args, **kwargs):
        return super(ProfileViewSet, self).partial_update(request, *args, **kwargs)

    @permission_classes((IsAdminUser, ))
    def destroy(self, request, *args, **kwargs):
        return super(ProfileViewSet, self).destroy(request, *args, **kwargs)

    @detail_route(methods=['get'], permission_classes=(IsAuthenticated, IsOwnerOrIsStaff))
    def skillsummary(self, request, *args, **kwargs):
        user = request.user
        summary = {
            key: nicely_serialize_verification_tests(values, user)
            for key, values in {
                'testsTaken': VerificationTest.objects.taken(user),
                'testsRecommended': VerificationTest.objects.recommended(user),
                'testsNotTaken': VerificationTest.objects.not_taken(user)
            }.items() }
        for st in summary['testsTaken']:
            if not st.has_key('results'):
                st['results'] = [{'result': 'INPROGRESS'}]
        return Response(summary)


class SkillTestViewSet(CreatorPermissionsMixin, NestedModelViewSet):
    queryset = SkillTest.objects.all()
    serializer_class = SkillTestSerializer
    parent_key = 'profile'

    def retrieve(self, request, *args, **kwargs):
        print 'request', request.user.id
        return super(SkillTestViewSet, self).retrieve(request, *args, **kwargs)

    def new_ticket(self, request):
        instance = SkillTest.objects.get(profile=Profile.objects.get(id=request.data['profile']), expertratings_test=request.data['expertratings_test'])
        serializer = SkillTestSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return serializer.data

    def create(self,  request, *args, **kwargs):
        try:
            return super(SkillTestViewSet, self).create(request, *args, **kwargs)
        except ValidationError, e: # just need a new ticket in expertratings
            #raise e
            return Response(self.new_ticket(request))

    @list_route(methods=['get'])
    def take(self, request, *args, **kwargs):
        request.data._mutable = True
        request.data['expertratings_test'] = str(request.query_params.get('expertratings_test', None))
        create_response = self.create(request, *args, **kwargs)
        return redirect(create_response.data['ticket_url'])

