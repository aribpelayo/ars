from django.urls import path
from django.conf.urls import url, include
from django.conf.urls.static import static

from . import views

app_name = "gallery"

urlpatterns = [
  path('update/', views.update, name='update'),
  path('new/', views.image_create, name='image_new'),
  path('train/', views.train, name='train'),
  path('edit/<int:pk>', views.image_update, name='image_edit'),
  path('delete/<int:pk>', views.image_delete, name='image_delete'),
  path('move/<int:pk>', views.move, name='move'),
  url(r'^$', views.index, name='index'),
  url(r'^timein/', views.timein, name='timein'),
  url(r'^snap/', views.snap, name='snap'),
  url(r'^logout/', views.logout, name='logout'),
  url(r'^reclassify/', views.reclassify, name='reclassify'),
]