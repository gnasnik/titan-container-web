#/bin/bash

version=$(cat version)
echo build version:$version

if [ -z "$version" ];then
        echo "input version number"
        exit 2
fi

##set color##
echoRed() { echo $'\e[0;31m'"$1"$'\e[0m'; }
echoGreen() { echo $'\e[0;32m'"$1"$'\e[0m'; }
echoYellow() { echo $'\e[0;33m'"$1"$'\e[0m'; }


if [ $? -eq 0 ];then
    echoGreen "docker build..."
    docker build . -t registry.cn-hongkong.aliyuncs.com/nft/container-web:$version  -f Dockerfile
    #echoGreen "docker push"
    #docker push registry.cn-hongkong.aliyuncs.com/nft/container-web:$version

else
        echoRed "go build failed...."
        exit 2
fi


echoGreen "please using bellow cmd to push docker hub.!!!"

