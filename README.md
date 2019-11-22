# FilmTime

FilmTime is a community-driven movie database concept. Users can contribute by adding a movie to the platform that can be continously updated with more information overtime. It is also a social platform through comment sections and individual profiles.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
node 8.x.x
npm 5.x.x
mongodb 3.x.x
```

### Installing

A step by step series of examples that tell you how to get a development env running

1. Clone the repository
```
git clone https://github.com/kazijawad/FilmTime.git
```

2. Enter the directory and install the necessary packages
```
cd FilmTime/
npm install
```

3. Create a .env file
```
touch .env
```

4. Include these environment variables with your preferred value
```
ADMIN_CODE=XXX
GMAIL=XXX
GMAIL_PW=XXX
MONGODB_URI=XXX
PORT=3000
SECRET=XXX
```

5. Run the npm script: npm start
```
npm start
```

6. The program will start properly with this message
```
Server is Online: Port 3000
Database is Online
```

7. To view the website locally on a web browser
```
https://localhost:3000
```

## Deployment

Deployed with [Heroku](https://www.heroku.com)

## Built With

* [Express](http://www.expressjs.com) - Web Framework
* [Mongoose](http://www.mongoosejs.com) - MongoDB Framework
* [SASS](https://sass-lang.com) - CSS Preprocessor

## Author

Kazi Jawad

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
