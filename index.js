//deklarasi atau pemanggilan package
const express = require('express');
const bcrypt = require('bcrypt');//untuk encripsi password
const session = require('express-session');//hak akses user
const flash = require('express-flash');//message alert

// deklarasi/import file database
const db = require('./connection/db');
//import upload file middlewares
const upload = require('./middlewares/uploadFile') //untuk handle file upload jpg, pnd, doc dll

const app = express();
const PORT = process.env.PORT || 5000;

const isLogin = true;


//setup views engine handlebars
app.set('view engine', 'hbs');
app.use(flash());//untuk menampilkan alert
app.use( 
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'secret',
    cookie: { maxAge: 1000 * 60 * 60 * 2 },
  })
);
app.use('/public', express.static(__dirname + '/public'));//pemanggilan file css agar tebaca
app.use('/uploads', express.static(__dirname + '/uploads')); //agar gambar upload terbaca
app.use(express.urlencoded({ extended: false }));


// routing
app.get('/', function (req, res) {
  console.log('User session Login: ', req.session.isLogin ? true : false);
  console.log('User : ', req.session.user ? req.session.user : {});


  db.connect(function (err, client, done) {
    if (err) throw err;

    let query = '';

    if (req.session.isLogin) {
      query = `SELECT tb_project.*, tb_user.id as "user_id", tb_user.name as "username", tb_user.email
                    FROM tb_project LEFT JOIN tb_user 
                    ON tb_project.author_id = tb_user.id WHERE tb_user.id=${req.session.user.id}`;
    } else {
      query = `SELECT tb_project.*, tb_user.id as "user_id", tb_user.name as "username", tb_user.email
                    FROM tb_project LEFT JOIN tb_user 
                    ON tb_project.author_id = tb_user.id`;
    }
    client.query(query, function (err, result) {
      //jika error masuk ke pramater err
      //jika tidak ada error dan ada hasilnya masuk ke parameter result
      if (err) throw err;
      done()

      // console.log(result.rows);//memanggil rows krn yang dibutuhkan hanya rows saja

      // Perulangan/looping
      // Pengembalian data/return
      let dataProjects = result.rows.map(function (data) {
        //memanggil kembali result rows karena sama2 aray of object
        const user_id = data.user_id;
        const username = data.username;
        const email = data.email;

        delete data.user_id;
        delete data.username;
        delete data.email;
        PATH ='http://localhost:5000/uploads/'
        // undefined==false;
        return {
          ...data,
         
          duration : getDistanceTime(data.start_date,data.end_date),
          start_date : getFullTime(data.start_date),
          end_date : getFullTime(data.end_date),
          isLogin :  req.session.isLogin,
          image : data.image ? PATH + data.image : null,
          author: {
            user_id,
            username,
            email,
          },
          // node_js : data.node_js ? data.node_js: undefined,
          // react_js : data.react_js ? data.react_js:undefined,
          // next_js : data.next_js ? data.next_js: undefined,
        };
      });
      console.log(dataProjects)


      res.render('index', {user: req.session.user, isLogin : req.session.isLogin,projects: dataProjects });
    });
  });
});
app.get('/contact-me', function (req, res) {
  isLogin
  res.render('contact-me',{isLogin});
});
app.get('/project-detail/:id', function (req, res) {
  let id = req.params.id;
 
  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_project WHERE id=${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;

      // console.log(result.rows);

      let project = result.rows[0];
    
      PATH ='http://localhost:5000/uploads/'
      // console.log(project);
      project = {
        ...project,
        duration : getDistanceTime(project.start_date,project.end_date),
        start_date : getFullTime(project.start_date),
        end_date : getFullTime(project.end_date),
        image : project.image ? PATH + project.image : null,
        isLogin,
      
      };
      
      res.render('project-detail', {isLogin, project });
    });
  });
});
app.get('/add-project', function (req, res) {
  res.render('add-project');
});
app.post('/add-project',upload.single('image'), function (req, res) {
  //pemanggilan req.body pada form add by name
  let data = req.body;
  // console.log(data)
  db.connect((err,client,done) => {
    if(err) throw err;

    const filename = req.file.filename;//get data link image at multer

    let query = `INSERT INTO tb_project 
                    (name,
                     start_date,
                     end_date,
                     description,
                     node_js,
                     react_js,
                     next_js,
                     type_script,
                     image,
                     author_id)
                VALUES
                      ('${data.name}',
                      '${data.start_date}', 
                      '${data.end_date}',
                      '${data.description}',
                      '${data.node_js}',
                      '${data.react_js}', 
                      '${data.next_js}',
                      '${data.type_script}',
                      '${filename}',
                      '${req.session.user.id}')`
              client.query(query,(err,result)=>{
              done();
              if(err) throw err;
              console.log(result.rows);
              req.flash('success', 'Success add data!');
              res.redirect('/')                 
    })
  })
});
app.post('/update-project/:id',upload.single('image'), function (req, res) {
  let id = req.params.id;
  // let{name,
  //   start_date,
  //   end_date,
  //   description, 
  //   node_js,
  //   react_js,
  //   next_js,
  //   type_script,
  //   image}=req.body;
  // let project={name,
  //             start_date,
  //             end_date,
  //             description,
  //             node_js,
  //             react_js,
  //             next_js,
  //             type_script,
  //             image};
  project=req.body;
  // project=req.body;
  console.log(project)

  db.connect(function(err,client,done){
      if(err) throw err;

  const filename = req.file.filename;//get data link image at multer
  const query = `UPDATE tb_project SET 
                   name ='${project.name}',
                   start_date ='${project.start_date}',
                   end_date ='${project.end_date}',
                   description = '${project.description}',
                   node_js = '${project.node_js}',
                   react_js =  '${project.react_js}',
                   next_js = '${project.next_js}',
                   type_script = '${project.type_script}',
                   image = '${filename}'
                WHERE 
                    id = ${id}`;   
                  
                    client.query(query,function(err,result){
                      if(err) throw err;
                      done()
                      req.flash('success', 'Success Update Data!');
                      console.log(result.rows)
        
          res.redirect('/')        
    });
  });
});
app.get('/update-project/:id', function (req, res) {
  let id = req.params.id;
 
  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_project WHERE id=${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;

      let data = result.rows;

      // console.log(update_project);
      data = data.map((update_project)=>{
        PATH ='http://localhost:5000/uploads/'
        return{
          ...update_project,
          start_date :  renderDate(update_project.start_date),
          end_date :  renderDate(update_project.end_date),
          image : update_project.image ? PATH + update_project.image : null,
          isLogin,
        }
      })
      console.log(data)
      res.render('update-project', {isLogin,  update_project : data });
    });
  });
});
app.get('/delete-project/:id', function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `DELETE  FROM tb_project WHERE id=${id}`;

    client.query(query,(err,result)=>{
      done();
      if(err) throw err;
      req.flash('delete', 'Success delete data!');
      res.redirect('/')                 
    })
  })
});
app.get('/register', function (req, res) {
  res.render('register');
});
app.post('/register', function (req, res) {
  const data = req.body;
  
  // kondisi untuk alert 
  if (data.name == '' || data.email == '' || data.password == '') {
    req.flash('error', 'Please insert all field!');
    return res.redirect('/register');
  }
  // deklari req.body dengan enkripsi
  const hashedPassword = bcrypt.hashSync(data.password, 10);

  db.connect(function (err, client, done) {
    if (err) throw err;
    
    const query = `INSERT INTO tb_user(name,email,password) VALUES('${data.name}','${data.email}','${hashedPassword}')`;
    
    client.query(query, function (err, result) {
      if (err) throw err;
      done();
      req.flash('success', 'Success register your account!');
      res.redirect('/login');
    });
  });

  // res.redirect('register');
});
app.get('/login', function (req, res) {
  res.render('login');
});
app.post('/login', function (req, res) {
  const data = req.body;
  console.log(data.email)
  db.connect(function (err, client, done) {
    if (err) throw err;
    // pencarian nama atau menampilkan berdasrkan email
    const query = `SELECT * FROM tb_user WHERE email = '${data.email}'`;
    
    client.query(query, function (err, result) {
      if (err) throw err;
      done();
      
      //Check account by email == 0 menandangkan panjang aaray tidak ada
      if (result.rows.length == 0) {
        req.flash('error', 'Email not found!');
        return res.redirect('/login');
      }
      // komparasi req.body dengan pass database
      const isMatch = bcrypt.compareSync(
        data.password,
        result.rows[0].password
        );
        
        // Check password
        if (isMatch == false) {
        req.flash('error', 'Wrong password!');
        return res.redirect('/login');
      } else {
        req.session.isLogin = true;
        req.session.user = {
          id: result.rows[0].id,
          email: result.rows[0].email,
          name: result.rows[0].name,
        };
        req.flash('success', 'Success Login!');
        res.redirect('/');
      }
    });
  });
});
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});
app.listen(PORT, function () {
  console.log(`Server start_dateing on PORT: ${PORT}`);
});


function getDistanceTime(start_date,end_date) {

  let distance = new Date(end_date) - new Date(start_date) // miliseconds
  let monthDistance = Math.floor(distance / (4 * 7 * 24 * 60 * 60 * 1000 )) // convert to month
  if(monthDistance != 0) {
    return monthDistance  + ' bulan'
  }else{
  let dayDistance = Math.floor(distance / (24 * 60 * 60 * 1000 )) // convert to day
  if(dayDistance != 0) {
    return   dayDistance  + ' hari'
    }
  }
}
function getFullTime(time) {
  let month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  let date = time.getDate();
  let monthIndex = time.getMonth();

  let year = time.getFullYear();

  

  let fullTime = `${date} ${month[monthIndex]} ${year}`;

  return fullTime;
}

function renderDate(formtime) { 
 
  let hari = [ 
      "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31" 
  ] ;

  let bulan = [ 
      "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12" 
  ] ;

  let date = formtime.getDate(); 
  let monthIndex = formtime.getMonth(); 
  let tahun = formtime.getFullYear(); 

  
  let fullTime = `${tahun}-${bulan[monthIndex]}-${hari[date]}`;

  return fullTime;
}
function Checkbox(tick){
  if (tick == "true")
  return true
  else if (tick != true){
    return false
  }
} 

