# node-note
A Node.js app to monitor your running process, send msg to phone when it completed

Setup:

## 1. Install NodeJS, git: 
   download from https://nodejs.org
   
## 2. Checkout repo:  
   git clone https://github.com/weixingsun/node-note.git
   
## 3. Setup Environment:
   cd node-note; npm i --save
   
## 4. Install app to your phone: [Only Android is available now]
   download from http://shareplus.co.nf
   
## 5. Open app, and find your UUID: 
   Go to Settings tab in right end corner, click on "About"
   
## 6. Ready to go!
   ./start.sh [UUID1,UUID2] [name] [condition]
   
   example 1: ./start.sh b3166003-1471-493d-be8f-aaabbbcccddd mysql '#<1'  
   # this will trigger event when mysql process was killed
   
   example 2: ./start.sh b3166003-1471-493d-be8f-aaabbbcccddd mysql 'cpu>90'  
   # this will trigger event when cpu usage higher than 90%
   
   example 3: ./start.sh b3166003-1471-493d-be8f-aaabbbcccddd,b3166003-1471-493d-be8f-cccdddaaabbb mysql 'mem>90'  
   # this will trigger 2 events when memory usage higher than 90%
