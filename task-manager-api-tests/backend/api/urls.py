from django.urls import path

from .views import LoginView, RefreshView, RegisterView, TaskDetailView, TaskListCreateView

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("login", LoginView.as_view(), name="login"),
    path("refresh", RefreshView.as_view(), name="refresh"),
    path("tasks", TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>", TaskDetailView.as_view(), name="task-detail"),
]
