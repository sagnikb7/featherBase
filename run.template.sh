export NODE_ENV=development
export PORT=8888
export DEBUG=true
export SERVICE_NAME=feather-base
export MONGO_DB=''
export AES_KEY=''
export AES_IV=''
export SENTRY_DSN=''
export VITE_IMG_DELIVERY_MODE='offline'

if [ -z "$1" ]
then
    echo "Running APPLICATION Server";
    export MODE="server";
elif [ $1 = "server" ]
then
    echo "Running APPLICATION server";
    export MODE="server";
fi

# For production: build frontend first, then start server
# npm run build:FE

# For development: run `pnpm dev` instead — starts backend + Vite dev server with hot reload
npx nodemon --trace-warnings index.js