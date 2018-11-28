# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render,redirect,get_object_or_404
from django.forms import ModelForm
from gallery.models import Image
from watson_developer_cloud import VisualRecognitionV3
from json import dumps
from zipfile import *
from django.http import HttpResponse
from base64 import b64decode
from django.views.decorators.csrf import csrf_exempt
from shutil import copyfile
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.contrib.auth.decorators import login_required
from django.contrib import auth

import zipfile, string, random, os, glob, json, sys, shutil

#visual_recognition = VisualRecognitionV3('2018-03-19',iam_apikey='JLBpeohMs_TqahmkqLR_Tv74qxlxHCK-3s4x3B99Vrv4')
visual_recognition = VisualRecognitionV3('2018-03-19',iam_apikey='c6IHWLhTl2g-sNwO09hKV5Kjm3BWLCyr4VJLpL2n_7_Y')

class ImageForm(ModelForm):
    class Meta:
        model = Image
        fields = ['name', 'image']

@login_required
def update(request, template_name='gallery/index.html'):
    data = notif()
    return render(request, template_name, {'data':data})

def image_create(request, template_name='gallery/form.html'):
    form = ImageForm(request.POST or None, request.FILES or None)
    if form.is_valid():
        vFormTemporal = form.save(commit=False)
        vClaseVR, vScoreVR = classifyImage(request.FILES['image'])
        vFormTemporal.resWatsonClase=vClaseVR
        vFormTemporal.resWatsonScore=vScoreVR
        vFormTemporal.save()
        return redirect('gallery:update')
    return render(request, template_name, {'form':form})   

@login_required
def classifyImage(Purl):
    classes = visual_recognition.classify(images_file=Purl,threshold='0.5',owners=["me"]).get_result()
    vResult=json.loads(json.dumps(classes, indent=2))
    vClase = 'No Image'
    vScore = -1
    try:
        for vImage in vResult['images']:
            for vClassifier in vImage['classifiers']:
                for vClases in vClassifier['classes']:
                    if vClases['score'] > vScore:
                        vClase = vClases['class']
                        vScore = vClases['score']
        return vClase, vScore
    except:
        vClase= 'No image'
        vScore= -1
        return vClase, vScore

@login_required
def train(request, template_name='gallery/train.html'):
    if request.POST and request.is_ajax():
        _image = request.POST.get('image_id')
        _dir = request.POST.get('dir')
        _basePath = settings.TRAIN_ROOT
        if(request.POST.get('rmv') == '1'):
            Image.objects.filter(name=_image).delete()
            os.remove(_basePath + _dir +'\\'+ _image)
            os.remove(settings.TMP_ROOT + _dir + '\\' + _image)
            os.remove(settings.TMP_ROOT + _image)
            return HttpResponse("done")
        else:
            _archivePath = settings.ARCHIVE_ROOT
            _dstFile = _archivePath + _dir
            _zipFile = _archivePath + _dir + '.zip'
            if (os.path.isfile(_zipFile)):
                os.remove(_zipFile)

            myzip = shutil.make_archive(_dstFile, 'zip', _basePath, _dir) 
            
            status = None
            classifiers = visual_recognition.list_classifiers(verbose=True).get_result()
            vResultClassifier=json.loads(json.dumps(classifiers, indent=2))
            for vClassifier in vResultClassifier['classifiers']:
                vC =vResultClassifier['classifiers'][0]['status']
                status = str(vC)
                print(status)
            if status == "retraining" or status == "failed":
                return HttpResponse("error")
            elif status == "ready":
                name = _dir
                kwargs = name + '_positive_examples'
                with open(myzip, 'rb') as name:
                    classes = visual_recognition.update_classifier(classifier_id='AIS_1412372771',
                        kwargs=name).get_result()
                    result=json.loads(json.dumps(classes, indent=2))
                    return HttpResponse("train")
            return HttpResponse("train")
    else:
        obj = {}
        data = notif()

        for key in os.listdir(settings.TRAIN_ROOT):
            for value in os.listdir(settings.TRAIN_ROOT + key):
                obj.setdefault(key, []).append(value)
        return render(request, template_name, {'obj':obj, 'data':data})

@login_required
def image_update(request, pk, template_name='gallery/form.html'):
    image = get_object_or_404(Image, pk=pk)
    form = ImageForm(request.POST or None, instance=image)
    if form.is_valid():
        form.save()
        return redirect('gallery:update')
    return render(request, template_name, {'form':form})

@login_required
def image_delete(request, pk, template_name='gallery/confirm_delete.html'):
    image = get_object_or_404(Image, pk=pk) 
    data = notif()  
    if request.method=='POST':
        image.delete()
        os.remove(settings.TMP_ROOT + image.suggested+'\\'+image.name)
        os.remove(settings.TMP_ROOT + image.name)
        return redirect('gallery:update')
    
    return render(request, template_name, {'object':image, 'data':data})   

@login_required
def move(request,pk, template_name='gallery/form.html'):
    image = get_object_or_404(Image,pk=pk)
    img   = image.image
    filename  = image.name
    dst = settings.TRAIN_ROOT + image.suggested
    if(not os.path.exists(dst)):
        os.mkdir(os.path.join(settings.TRAIN_ROOT, image.suggested))
    try:
        copyfile(img, dst +'\\' + filename)
        db = Image.objects.get(name=filename)
        db.retrain = 0
        db.save()
        return redirect('gallery:update')
    except:
        return redirect('gallery:update')


def index(request):
    data = notif()
    return render(request, 'gallery/home.html', {'data':data})

def snap(request):
  if request.POST and request.is_ajax():  
    image_data = b64decode(request.POST.get("image_data", ""))
    filename = id_generator()+'.png'
    fh = open(settings.TMP_ROOT + filename, "wb")
    fh.write(image_data)
    fh.close();
    image = getImage(settings.TMP_ROOT)
    path = settings.TMP_ROOT + image
    vClase, vScore = classifyScreenshot(path)

    db = Image(name=filename, 
            image=path,
            clase=vClase,
            score=vScore * 100,
            retrain=0);
    db.save();

    vClasif = classRetrieve()
    return HttpResponse(json.dumps({ 'clase':vClase ,'score': str(round((vScore * 100), 2)), 'classif':vClasif }), content_type="application/json")

def id_generator(size=8, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def getImage(filePath):
    os.chdir(filePath)
    files = sorted(os.listdir(os.getcwd()), key=os.path.getmtime)
    return files[-1] 

def classifyScreenshot(Purl):
    with open(Purl, 'rb') as images_file:
        classes = visual_recognition.classify(images_file,threshold='0.9',owners=["me"]).get_result()
        vResult = json.loads(json.dumps(classes, indent=2))
        try:
            vClase = vResult['images'][0]['classifiers'][0]['classes'][0]['class']
            vScore = vResult['images'][0]['classifiers'][0]['classes'][0]['score']
        except IndexError:
            vClase = 'null'
            vScore = 0
        return vClase, vScore

def classRetrieve():
    classifiers = visual_recognition.list_classifiers(verbose=True).get_result()
    vResultClassifier=json.loads(json.dumps(classifiers, indent=2))
    vClasif = list()
    try:
        for vClassifier in vResultClassifier['classifiers']:
            for vClasifs in vClassifier['classes']:
                vClasif.append(vClasifs['class'])
        return vClasif
    except:
        vClasif= 'No Classifier Available'
        return vClasif

def reclassify(request):
  if request.POST and request.is_ajax(): 
    dirname = request.POST.get('retData')
    path = settings.TMP_ROOT
    dst = os.path.join(path, dirname + '\\')
    image = getImage(path)

    if(os.path.exists(dst)):
        copyfile(path + image, dst +image)
    else:
        os.mkdir(os.path.join(path, dirname))
        copyfile(path + image, dst + image)

    db = Image.objects.get(name=image)
    db.image = dst + image
    db.suggested = dirname
    db.retrain = 1
    db.save()

    return HttpResponse('Done')

def timein(request):
    return render(request, 'gallery/success.html')

def logout(request):
    auth.logout(request)
    return render(request,'gallery/home.html')

def notif():
    data = {}
    images = Image.objects.filter(retrain=1)
    data['object_list'] = images
    return data