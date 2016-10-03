# iMess - iMessage API Server
Node backend for interacting with iMessage on OSX. Built using Node, ExpressJS, and Sqlite.

## For use with [iMess Client](https://github.com/alex-red/imess-client)

# Install
> Git clone

> npm install

> npm start

# Usage
> API endpoint located at http://localhost:44055/api

# API
> /chats GET

  Retrieve all chats
> /messages GET

  Retrieve all messages
> /messages/:chat_id GET

  Retrieve all messages in a given chat
> /message/:person/:message POST

  Send :message to :person (id)
> /attachments GET

  Retrieve all attachments
