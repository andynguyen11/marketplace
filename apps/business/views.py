from django.views.generic import TemplateView
from django.shortcuts import render
from business.models import Project

class ProjectsView(TemplateView):
    """
    Return a 404 status on missing project's page
    This helps resolve soft 404s on page crawls
    """
    template_name = "spa.html"

    def get_context_data(self, **kwargs):
        context = super(ProjectsView, self).get_context_data(**kwargs)
        return context

    def get(self, request, project_slug):
        context = self.get_context_data()

        try:
            project = Project.objects.get(slug=project_slug)
        except Project.DoesNotExist:
            return render(request, self.template_name, context, status=404)

        return render(request, self.template_name, context)
