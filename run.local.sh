export NODE_ENV=local
export PORT=8888
export DEBUG=true
export SERVICE_NAME=bird
export MONGO_DB='mongodb://127.0.0.1:27017/featherBase'
export AES_KEY=''
export AES_IV=''
export SENTRY_DSN=''

if [ -z "$1" ]
then
    echo "Running APPLICATION Server 💃";
    export MODE="server";
elif [ $1 = "server" ]
then
    echo "Running APPLICATION server 💃";
    export MODE="server";
fi

npx nodemon --trace-warnings index.js