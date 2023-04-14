const http = require("http"); 
//create a server object: 
http 
    .createServer(function (req, res) { 
    res.write("<h1>Hello World!</h1>"); 
    //write a response to the client  
    res.end();
    //end the response 
    }) .listen(3000); 
//Server runs on localhost:3000 

app.get('/login', (req, res)=>{
    res.render('pages/login.ejs');
});

app.post('/login', async (req, res)=>{
    const query = "SELECT * FROM users WHERE (username = $1);";
    db.any(query,[req.body.username])
    .then(async (data)=>{
      const user = data;
      console.log(data);
      const match = await bcrypt.compare(req.body.password, data[0].password);
      if(match){
        req.session.user = user;
        req.session.save();
        res.redirect('/home');
      }
      else{
        res.redirect('/register');
      }
    })
    .catch(function(err){
      console.log(err);
      res.render('pages/login.ejs', {message: 'Incorrect username or password.'});
    })
});



app.get('/register', (req, res)=>{
    res.render('pages/register.ejs');
});


app.post('/register', async (req,res)=>{
    //still need to come up with a place holder image when they register.
    const hash = await bcrypt.hash(req.body.password, 10);
    const query = 'INSERT INTO users (username, password) values ($1, $2);';
    db.any(query,[req.body.username, hash])
    .then(function(data) {
        res.redirect('/login');
    })
    .catch(function(err){
      console.log(err);
      res.redirect('/register');
    })
});

app.get('/home', (req,res)=>{
    res.render('pages/home.ejs');
});
