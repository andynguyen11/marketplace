
from accounts.models import Profile, Employee


def account_analysis(profile):
    baseline = 50
    role_booster = 1
    experience_booster = .1
    bio_booster = .5
    skill_booster = .2
    work_history_booster = 1
    work_example_booster = 1
    description_booster = .5
    title_boosters = {
        'director': .5,
        'senior': .5,
        'lead': .5,
        'svp': 1,
        'vp': 1,
        'principal': 1,
        'partner': 1,
        'owner': 1,
        'chair': 1,
        'chief': 1,
        'ceo': 1,
        'cto': 1,
        'cpo': 1,
        'cro': 1,
        'cfo': 1,
        'founder': 1,
        'president': 1,
    }
    if profile.roles:
        # Point calculations
        role_points = role_booster * profile.roles.count()
        experience_points = 0
        for role in profile.roles.all():
            experience_points = experience_points + (role.years * experience_booster) if role.years else experience_points
        bio_points = bio_booster if len(profile.long_description) >= 140 else 0
        skill_points = skill_booster * profile.skills.count() if profile.skills else 0
        title_points = 0
        description_points = 0
        work_history = Employee.objects.filter(profile=profile)
        work_history_points = work_history_booster * work_history.count() if work_history else 0
        for work in work_history:
            if work.title:
                title_points = title_points + sum([points for title, points in title_boosters.iteritems() if title in work.title.lower()])
            if work.description:
                description_points = description_points + description_booster if len(work.description) >= 140 else description_points

        work_examples_points = work_example_booster * profile.work_examples.count()

        # Adjustments
        work_history_points = 4 if work_history_points > 4 else work_history_points
        title_points = 4 if title_points > 4 else title_points
        description_points = 4 if description_points > 4 else description_points
        work_examples_points = 3 if work_examples_points > 3 else work_examples_points

        # Total
        profile_score = baseline + role_points + experience_points + bio_points + skill_points + work_examples_points + work_history_points + title_points + description_points
        return profile_score