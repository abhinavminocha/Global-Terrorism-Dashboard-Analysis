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
countr=NULL
terr=NULL
startyear=NULL
endyear=NULL

@app.route("/")
def d3():
    return render_template('index2.html')

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
        startm=request.args.get('startm', type=str)
        endy=request.args.get('endy', type=str)
        endm=request.args.get('endm', type=str)
        if country=='All':
            if starty=='2015' and endy=='2018':
                countdf1=df2.groupby('city')['city'].count().reset_index(name="count")

            else:
                countdf2=df2[df2['iyear'].isin([starty,endy])]
                countdf1=countdf2.groupby('city')['city'].count().reset_index(name="count")
        else:
            if starty=='2015' and endy=='2018':
                countdf1= dfbycountry(country)
                countdf1=countdf1.groupby('city')['city'].count().reset_index(name="count")
            else:
                countdf1= dfbycountry(country)
                countdf2=countdf1[countdf1['iyear'].isin([starty,endy])]
                countdf1=countdf2.groupby('city')['city'].count().reset_index(name="count")

        piedata1= countdf1.to_json(orient='records')
        text={"piedata":piedata1,"starty":starty,"endy":endy}
        return json.dumps(text)

@app.route('/getDataPerCountryBar1')
def getDataPerCountryBar1():
    country = request.args.get('country', type=str)
    starty=request.args.get('starty', type=str)
    startm=request.args.get('startm', type=str)
    endy=request.args.get('endy', type=str)
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

@app.route('/getRadial')
def getRadial():
   country = request.args.get('country', type=str)
   if country=='All':
        df3 = df2.groupby(["gname"]).nkill.sum().reset_index()
   else:
        countryspecificdf = dfbycountry(country)
        df3=countryspecificdf.groupby(["gname"]).nkill.sum().reset_index()

   bardata= df3.to_json(orient='records')
   bardata = json.dumps(bardata, indent=2)
   return bardata

@app.route('/getRadial1')
def getRadial1():
   country = request.args.get('country', type=str)
   starty = request.args.get('starty', type=str)
   endy = request.args.get('endy', type=str)
   if country=='All':
        df3=df2[df2['iyear'].isin([starty,endy])]
        df3 = df3.groupby(["gname"]).nkill.sum().reset_index()
   else:
        countryspecificdf = dfbycountry(country)
        df3=countryspecificdf[countryspecificdf['iyear'].isin([starty,endy])]
        df3=df3.groupby(["gname"]).nkill.sum().reset_index()

   bardata= df3.to_json(orient='records')
   bardata = json.dumps(bardata, indent=2)
   return bardata


if __name__ == "__main__":
    app.run( debug=True)