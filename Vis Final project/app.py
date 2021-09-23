import pandas as pd 
import numpy as np 
from flask import Flask
from flask import render_template
import json
import csv
import logging
from flask import request
from collections import defaultdict


app = Flask(__name__)

df2 = pd.read_csv(r'data/df2015-18.csv')
dfyear= pd.read_csv("data/df2015-18.csv")
file=open('static/params.json')
json_d=json.load(file)
json_d['starty']="2015"
json_d['endy']="2018"
json_d['terrorist']=""
json_d['country']="All"
json_d['city']=""
with open("static/params.json", "w") as jsonFile:
         json.dump(json_d, jsonFile)



@app.route("/")
def d3():
    return render_template('index2.html')

@app.route("/reset")
def reset():
    country = request.args.get('country', type=str)
    json_d['starty']="2015"
    json_d['endy']="2018"
    json_d['terrorist']=""
    json_d['country']=country
    json_d['city']=""
    json_d['attacktype']=""
    with open("static/params.json", "w") as jsonFile:
             json.dump(json_d, jsonFile)

#get a country's data- pie
def dfbycountry(countrycode):
    dfcountry= df2.loc[df2['code'] ==countrycode] 
    return dfcountry

#get country's data - sun
def dfbycountrysun(countrycode):
    dfc1= dfyear.loc[dfyear['code'] ==countrycode] 
    return dfc1

@app.route('/getCSV')
def getCSV():
    piedata= df2.to_json(orient='records')
    piedata = json.dumps(piedata, indent=2)
    return piedata

@app.route('/getCountryCSV')
def getCSV1():
    country = request.args.get('country', type=str)
    countdf1= dfbycountry(country)
    piedata= countdf1.to_json(orient='records')
    piedata = json.dumps(piedata, indent=2)
    return piedata

@app.route('/getYearCSV')
def getCSV3():
    country = request.args.get('country', type=str)
    starty = request.args.get('starty', type=str)
    endy = request.args.get('endy', type=str)
    if country=='All':
        countdf11=df2[df2['iyear'].isin([starty,endy])]
    else:
        countdf1= dfbycountry(country)
        countdf11=countdf1[countdf1['iyear'].isin([starty,endy])]
    piedata= countdf11.to_json(orient='records')
    piedata = json.dumps(piedata, indent=2)
    return piedata

@app.route('/getCountryName')
def getCountryName():
    country = request.args.get('country', type=str)
    countdf1= dfbycountry(country)
    countdf=countdf1.groupby('country_txt')['country_txt'].count().reset_index(name="count")
    piedata=countdf['country_txt']
    piedata1= piedata.to_json(orient='records')
    text={"piedata":piedata1,"starty":"2015","endy":"2018"}
    return json.dumps(text)

@app.route('/getDataPerCountryPie')
def getDataPerCountryPie():
    country = request.args.get('country', type=str)
    starty=request.args.get('starty', type=str)
    print('starty',starty)
    countr=country
    if country=='All':
        countdf=df2.groupby('city')['city'].count().reset_index(name="count")
        piedata= countdf.to_json(orient='records')
        text={"piedata":piedata,"starty":"2015","endy":"2018"}
        return json.dumps(text)
    else:
        countdf1= dfbycountry(country)
        countdf1=countdf1.groupby('city')['city'].count().reset_index(name="count")
        countdf1.sort_values(by="count",ascending=False,kind="mergesort")
        piedata1= countdf1.to_json(orient='records')
        text={"piedata":piedata1,"starty":"2015","endy":"2018"}
        return json.dumps(text)

@app.route('/getDataPerCountryPie1')
def getDataPerCountryPie1():
        country = request.args.get('country', type=str)
        starty=request.args.get('starty', type=str)
        startyear=starty
        startm=request.args.get('startm', type=str)
        endy=request.args.get('endy', type=str)
        terrorist=request.args.get('terrorist', type=str)
        if terrorist==None:
            terrorist=""
        terr=terrorist
        print("terrorist",terr)
        endyear=endy
        endm=request.args.get('endm', type=str)
        if country=='All':
            if starty=='2015' and endy=='2018':
                if terr!="":
                    countdf1= df2.loc[df2['gname'] ==terr]
                    countdf1=countdf1.groupby('city')['city'].count().reset_index(name="count")
                else:
                    countdf1=df2.groupby('city')['city'].count().reset_index(name="count")

            else:
                if terr!="":
                    countdf3= df2.loc[df2['gname'] ==terr]
                    countdf2=countdf3[countdf3['iyear'].isin([starty,endy])]
                    countdf1=countdf2.groupby('city')['city'].count().reset_index(name="count")
                else:
                    countdf2=df2[df2['iyear'].isin([starty,endy])]
                    countdf1=countdf2.groupby('city')['city'].count().reset_index(name="count")
        else:
            if starty=='2015' and endy=='2018':
                if terr!="":
                         countdf3= dfbycountry(country)
                         countdf2= countdf3.loc[countdf3['gname'] ==terr]
                         countdf1=countdf2.groupby('city')['city'].count().reset_index(name="count")
                else:
                         countdf1= dfbycountry(country)
                         countdf1=countdf1.groupby('city')['city'].count().reset_index(name="count")
            else:
                if terr!="":
                         countdf3= dfbycountry(country)
                         countdf4= countdf3.loc[countdf3['gname'] ==terr]
                         countdf2=countdf4[countdf4['iyear'].isin([starty,endy])]
                         countdf1=countdf2.groupby('city')['city'].count().reset_index(name="count")
                else:
                    countdf1= dfbycountry(country)
                    countdf2=countdf1[countdf1['iyear'].isin([starty,endy])]
                    countdf1=countdf2.groupby('city')['city'].count().reset_index(name="count")


        piedata1= countdf1.to_json(orient='records')
        text={"piedata":piedata1,"starty":starty,"endy":endy,"terrorist":terr}
        return json.dumps(text)

@app.route('/getDataPerCountryBar1')
def getDataPerCountryBar1():
    country = request.args.get('country', type=str)
    starty=request.args.get('starty', type=str)
    startyear=starty
    startm=request.args.get('startm', type=str)
    endy=request.args.get('endy', type=str)
    endyear=endy
    endm=request.args.get('endm', type=str)
    if country=='All':
        if starty=='2015' and endy=='2018':
            df3=df2.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
        else:
            countdf2=df2[df2['iyear'].isin([starty,endy])]
            df3=countdf2.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
    else:
        if starty=='2015' and endy=='2018':
            countryspecificdf = dfbycountry(country)
            df3=countryspecificdf.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
        else:
            countdf1 = dfbycountry(country)
            countdf2=countdf1[countdf1['iyear'].isin([starty,endy])]
            df3=countdf2.groupby('attacktype1_txt')['attacktype1'].count().reset_index(name="count")


    bardata= df3.to_json(orient='records')
    bardata = json.dumps(bardata, indent=2)

    return bardata

@app.route('/getDataPerCountryBar')
def getDataPerCountryBar():
    country = request.args.get('country', type=str)
    if country=='All':
        df3=df2.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
    else:
        countryspecificdf = dfbycountry(country)
        df3=countryspecificdf.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
    
    bardata= df3.to_json(orient='records')
    bardata = json.dumps(bardata, indent=2)

    return bardata


@app.route('/getDataPerCountryBar3')
def getDataPerCountryBar3():
    country = request.args.get('country', type=str)
    starty = request.args.get('starty', type=str)
    endy = request.args.get('endy', type=str)
    city = request.args.get('city', type=str)
    terrorist = request.args.get('terrorist', type=str)

    if city==None:
        city=json_d['city']
    else:
        json_d['city']=city

    if country==None:
        country=json_d['country']
    else:
        json_d['country']=country

    if starty==None:
        starty=json_d['starty']
    else:
        json_d["starty"]=starty

    if endy==None:
        endy=json_d['endy']
    else:
        json_d['endy']=endy

    if terrorist==None:
        terrorist=json_d['terrorist']
    else:
        json_d['terrorist']=terrorist


    with open("static/params.json", "w") as jsonFile:
         json.dump(json_d, jsonFile)

    if country=='All':
          df1=df2
    else:
            df1 = dfbycountry(country)
            #df3=countryspecificdf.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
    print('dfc1',len(df1))
    if starty!='2015' or endy!='2018':
        df3=df1[df1['iyear'].isin([starty,endy])]
    else:
        df3=df1

    print('df1',len(df1))
    if terrorist!="":
        df5=df3.loc[df3['gname']==terrorist]
    else:
        df5=df3

    print('dfc5',len(df5))
    if city!="":
        df6=df5.loc[df5['city']==city]
    else:
        df6=df5

    print('dfc2',len(df6))
    df4=df6.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
    bardata= df4.to_json(orient='records')
    bardata = json.dumps(bardata, indent=2)

    return bardata

@app.route('/getDataPerCountryCityBar')
def getDataPerCountryCityBar():

    country = request.args.get('city', type=str)
    city= df2.loc[df2['city'] ==country]

    df3=city.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")

    bardata= df3.to_json(orient='records')
    bardata = json.dumps(bardata, indent=2)

    return bardata


@app.route('/getDataPerCountryCityBar1')
def getDataPerCountryCityBar1():

    country = request.args.get('city', type=str)
    starty = request.args.get('starty', type=str)
    endy = request.args.get('endy', type=str)
    city= df2.loc[df2['city'] ==country]
    city=city[city['iyear'].isin([starty,endy])]
    df3=city.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")

    bardata= df3.to_json(orient='records')
    bardata = json.dumps(bardata, indent=2)

    return bardata




@app.route('/getYearAttack')
def getDataYearAttack():
#                country = request.args.get('country', type=str)
#                starty = request.args.get('starty', type=str)
#                endy = request.args.get('endy', type=str)
#                city = request.args.get('city', type=str)
#                terrorist = request.args.get('terrorist', type=str)
#                attacktype = request.args.get('attacktype', type=str)
#
#                if attacktype==None:
#                       attacktype=json_d['attacktype']
#                else:
#                       json_d['attacktype']=attacktype
#
#                if city==None:
#                    city=json_d['city']
#                else:
#                    json_d['city']=city
#
#                if country==None:
#                    country=json_d['country']
#                else:
#                    json_d['country']=country
#
#                if starty==None:
#                    starty=json_d['starty']
#                else:
#                    json_d["starty"]=starty
#
#                if endy==None:
#                    endy=json_d['endy']
#                else:
#                    json_d['endy']=endy
#
#                if terrorist==None:
#                    terrorist=json_d['terrorist']
#                else:
#                    json_d['terrorist']=terrorist
#
#
#                with open("static/params.json", "w") as jsonFile:
#                     json.dump(json_d, jsonFile)
#
#                if country=='All':
#                      df1=df2
#                else:
#                        df1 = dfbycountry(country)
#                        #df3=countryspecificdf.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
#                print('dfc1',len(df1))
#                if starty!='2015' or endy!='2018':
#                    df3=df1[df1['iyear'].isin([starty,endy])]
#                else:
#                    df3=df1
#
#                print('df1',len(df1))
#                if terrorist!="":
#                    df5=df3.loc[df3['gname']==terrorist]
#                else:
#                    df5=df3
#
#                print('dfc5',len(df5))
#                if city!="":
#                    df6=df5.loc[df5['city']==city]
#                else:
#                    df6=df5
#
#
#                if attacktype!="":
#                    df7=df6.loc[df6['attacktype1_txt']==attacktype]
#                else:
#                    df7=df6
#
#                df9=df7.groupby(['iyear','imonth'])['iyear'].count().reset_index(name="count")
#                bardata= df9.to_json(orient='records')
#                text={"bardata":bardata,"country":country}
#                return json.dumps(text)
    country = request.args.get('country', type=str)
    if country=='All':
        df3=df2.groupby(['iyear','imonth'])['iyear'].count().reset_index(name="count")
    else:
        countryspecificdf = dfbycountry(country)
        df3=countryspecificdf.groupby(['iyear','imonth'])['iyear'].count().reset_index(name="count")

    bardata= df3.to_json(orient='records')
    text={"bardata":bardata,"country":country}
    return json.dumps(text)



@app.route('/getTextData')
def getTextData():
    country = request.args.get('country', type=str)
    if country=="All":
        incidents = df2.shape[0]
        casulties = int(df2['nkill'].sum())
        wounded = int(df2['nwound'].sum())
    else:
        countryspecificdf = dfbycountry(country)
        incidents = countryspecificdf.shape[0]
        casulties = int(countryspecificdf['nkill'].sum())
        wounded = int(countryspecificdf['nwound'].sum())
    
    textdata = {"incidents":incidents, "casulties":casulties, "wounded":wounded}
    return json.dumps(textdata)

@app.route('/getTextData1')
def getTextData1():
    country = request.args.get('country', type=str)
    starty = request.args.get('starty', type=str)
    endy = request.args.get('endy', type=str)
    if country=="All":
        if starty=='2015' and endy=='2018':
                incidents = df2.shape[0]
                casulties = int(df2['nkill'].sum())
                wounded = int(df2['nwound'].sum())
        else:
                df3=df2[df2['iyear'].isin([starty,endy])]
                incidents = df3.shape[0]
                casulties = int(df3['nkill'].sum())
                wounded = int(df3['nwound'].sum())
    else:
        if starty=='2015' and endy=='2018':
                countryspecificdf = dfbycountry(country)
                incidents = countryspecificdf.shape[0]
                casulties = int(countryspecificdf['nkill'].sum())
                wounded = int(countryspecificdf['nwound'].sum())
        else:
                countryspecificdf = dfbycountry(country)
                countryspecificdf=countryspecificdf[countryspecificdf['iyear'].isin([starty,endy])]
                incidents = countryspecificdf.shape[0]
                casulties = int(countryspecificdf['nkill'].sum())
                wounded = int(countryspecificdf['nwound'].sum())

    textdata = {"incidents":incidents, "casulties":casulties, "wounded":wounded}
    return json.dumps(textdata)

@app.route('/getTextData3')
def getTextData3():
    country = request.args.get('city', type=str)
    starty = request.args.get('starty', type=str)
    endy = request.args.get('endy', type=str)
    df3=df2[df2['city']==country]
    countryspecificdf=df3[df3['iyear'].isin([starty,endy])]
    incidents = countryspecificdf.shape[0]
    casulties = int(countryspecificdf['nkill'].sum())
    wounded = int(countryspecificdf['nwound'].sum())

    textdata = {"incidents":incidents, "casulties":casulties, "wounded":wounded}
    return json.dumps(textdata)



@app.route('/getCountry')
def getCountry():
    country = request.args.get('country', type=str)
    textdata = {"country":country}
    return json.dumps(textdata)

@app.route('/getRadial1')
def getRadial1():
   country = request.args.get('country', type=str)
   if country=='All':
        df3 = df2.groupby(["gname"]).nkill.sum().reset_index()
   else:
        countryspecificdf = dfbycountry(country)
        df3=countryspecificdf.groupby(["gname"]).nkill.sum().reset_index()

   bardata= df3.to_json(orient='records')
   bardata = json.dumps(bardata, indent=2)
   return bardata

@app.route('/getRadial')
def getRadial():
   country = request.args.get('country', type=str)
   starty = request.args.get('starty', type=str)
   endy = request.args.get('endy', type=str)
   terrorist = request.args.get('terrorist', type=str)
   if terrorist==None:
        terrorist=''
   if country=='All':
        df3=df2[df2['iyear'].isin([starty,endy])]
        df3 = df3.groupby(["gname"]).nkill.sum().reset_index()
   else:
        countryspecificdf = dfbycountry(country)
        df3=countryspecificdf[countryspecificdf['iyear'].isin([starty,endy])]
        df3=df3.groupby(["gname"]).nkill.sum().reset_index()

   bardata= df3.to_json(orient='records')
   text={"bardata":bardata,"starty":starty,"endy":endy,"terrorist":terrorist}
   return json.dumps(text, indent=2)



@app.route('/getRadial3')
def getRadial3():
           country = request.args.get('country', type=str)
           starty = request.args.get('starty', type=str)
           endy = request.args.get('endy', type=str)
           city = request.args.get('city', type=str)
           terrorist = request.args.get('terrorist', type=str)
           attacktype = request.args.get('attacktype', type=str)

           if attacktype==None:
                  attacktype=json_d['attacktype']
           else:
                  json_d['attacktype']=attacktype

           if city==None:
               city=json_d['city']
           else:
               json_d['city']=city

           if country==None:
               country=json_d['country']
           else:
               json_d['country']=country

           if starty==None:
               starty=json_d['starty']
           else:
               json_d["starty"]=starty

           if endy==None:
               endy=json_d['endy']
           else:
               json_d['endy']=endy

           if terrorist==None:
               terrorist=json_d['terrorist']
           else:
               json_d['terrorist']=terrorist


           with open("static/params.json", "w") as jsonFile:
                json.dump(json_d, jsonFile)

           if country=='All':
                 df1=df2
           else:
                   df1 = dfbycountry(country)
                   #df3=countryspecificdf.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
           print('dfc1',len(df1))
           if starty!='2015' or endy!='2018':
               df3=df1[df1['iyear'].isin([starty,endy])]
           else:
               df3=df1

           print('df1',len(df1))
           if terrorist!="":
               df5=df3.loc[df3['gname']==terrorist]
           else:
               df5=df3

           print('dfc5',len(df5))
           if city!="":
               df6=df5.loc[df5['city']==city]
           else:
               df6=df5


           if attacktype!="":
               df7=df6.loc[df6['attacktype1_txt']==attacktype]
           else:
               df7=df6

           print('dfc2',len(df6))
           df7=df7.groupby(["gname"]).nkill.sum().reset_index()

           bardata= df7.to_json(orient='records')
           text={"bardata":bardata,"starty":starty,"endy":endy,"terrorist":terrorist}
           return json.dumps(text, indent=2)


@app.route('/getDataPerCountryPie3')
def getDataPerCountryPie3():
        country = request.args.get('country', type=str)
        starty = request.args.get('starty', type=str)
        endy = request.args.get('endy', type=str)
        city = request.args.get('city', type=str)
        terrorist = request.args.get('terrorist', type=str)
        attacktype = request.args.get('attacktype', type=str)

        if attacktype==None:
            attacktype=json_d['attacktype']
        else:
            json_d['attacktype']=attacktype

        if city==None:
            city=json_d['city']
        else:
            json_d['city']=city

        if country==None:
            country=json_d['country']
        else:
            json_d['country']=country

        if starty==None:
            starty=json_d['starty']
        else:
            json_d["starty"]=starty

        if endy==None:
            endy=json_d['endy']
        else:
            json_d['endy']=endy

        if terrorist==None:
            terrorist=json_d['terrorist']
        else:
            json_d['terrorist']=terrorist


        with open("static/params.json", "w") as jsonFile:
             json.dump(json_d, jsonFile)

        if country=='All':
              df1=df2
        else:
                df1 = dfbycountry(country)
                #df3=countryspecificdf.groupby(['attacktype1_txt'])['attacktype1'].count().reset_index(name="count")
        print('dfc1',len(df1))
        if starty!='2015' or endy!='2018':
            df3=df1[df1['iyear'].isin([starty,endy])]
        else:
            df3=df1

        print('df1',len(df1))
        if terrorist!="":
            df5=df3.loc[df3['gname']==terrorist]
        else:
            df5=df3

        print('dfc5',len(df5))
        if city!="":
            df6=df5.loc[df5['city']==city]
        else:
            df6=df5

        if attacktype!="":
              df7=df6.loc[df6['attacktype1_txt']==attacktype]
        else:
              df7=df6

        print('dfc2',len(df7))

        countdf=df7.groupby('city')['city'].count().reset_index(name="count")
        piedata= countdf.to_json(orient='records')
        text={"piedata":piedata,"starty":"2015","endy":"2018"}
        return json.dumps(text)



if __name__ == "__main__":
    app.run( debug=True)