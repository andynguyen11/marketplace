# from dicttoxml import dicttoxml
import lxml.etree as et
import xmltodict
from io import BytesIO

from django.core.urlresolvers import reverse


def upper_camel_case(value):
    def camelcase(): 
        while True:
            yield str.capitalize
    c = camelcase()
    return "".join(c.next()(x) if x else '_' for x in value.split("_"))


def xml_to_body_str(xml_element):
    root = et.ElementTree(xml_element)
    with BytesIO() as f:
        root.write(f, encoding='utf-8', xml_declaration=True, pretty_print=True) 
        return f.getvalue()


def buildxml(r, d):
    """ transforms a dict into an xml tree with leaf nodes as attributes
        {'auth': {'pass': 'word', 'user': 'name' }} #=>
        <auth pass="word" user="name"></auth>
    """
    if isinstance(d, dict):
        for k, v in d.iteritems():
            if k == '_text':
                r.text = v
            elif isinstance(v, tuple) or isinstance(v, list) or isinstance(v, dict):
                s = et.SubElement(r, k)
                buildxml(s, v)
            else: r.set(k, unicode(v))
    elif isinstance(d, tuple) or isinstance(d, list):
        for v in d:
            if isinstance(v, dict) and len(v.keys()) == 1:
                key = v.keys()[0]
                s = et.SubElement(r, key)
                buildxml(s, v[key])
            else:
                s = et.SubElement(r, 'i')
                buildxml(s, v)
    elif isinstance(d, basestring):
        r.text = d
    else:
        r.text = str(d)
    return r


def dict2xml(d, name=None):
    if name is None and len(d.keys()) == 1:
        name = d.keys()[0]
        d = d[name]
    if name is None:
        raise TypeError('xml document must have a root name or a single root key')
    r = et.Element(name)
    return buildxml(r, d)

def xml2dict(string):
    return xmltodict.parse(string)


def xml_body(d):
    return xml_to_body_str(dict2xml(d))

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

