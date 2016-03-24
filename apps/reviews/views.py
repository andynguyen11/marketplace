from django.contrib.auth.decorators import login_required
from django.http import HttpResponse


@login_required
def create_review(request):
    if request.POST:
        job = Job.objects.get(id=request.POST['job_id'])
        if job.customer == request.user.customer:
            review = Review(job=job,
                            provider=job.provider,
                            rating=int(request.POST['rating']),
                            notes=request.POST['notes'])
            job.date_reviewed = datetime.datetime.now()
            job.save()
            review.save()
            return HttpResponse(status=200)
    return HttpResponse(status=400)