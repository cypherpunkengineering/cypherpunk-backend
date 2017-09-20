pm2 stop all
pm2 delete all
pm2 start server.js -i max
pm2 start daemons/amazon-recurring/index.js --name="amazon"
pm2 start daemons/expire-user/index.js --name="expire"
