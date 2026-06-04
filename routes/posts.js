var express = require('express');
var router = express.Router();
var {getConnection} = require('./connect');
const oracledb = require('oracledb');

//게시판
router.get('/', function(req, res, next){
    res.render('index', { title: '게시판', pageName: 'posts/list.ejs'});
});

//게시글 목록 데이터
router.get('/list.json', async function(req, res){
    let con;
    let size = parseInt(req.query.size) || 5;
    let page = parseInt(req.query.page) || 1;
    let word = req.query.word || '';
    let off_rows = (page-1) * size;
    try{
        con = await getConnection();
        let sql =" select * from view_posts ";
            sql+=` WHERE TITLE LIKE '%${word}%' OR CONTENT LIKE '%${word}%' OR SNAME LIKE '%${word}%'`;
            sql+=" order by id desc ";
            sql+=` OFFSET ${off_rows} ROWS FETCH NEXT ${size} ROWS ONLY`;
        let result = await con.execute(sql, {}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
        let list = result.rows;


        sql = "select count(*) from view_posts ";
        sql+=` WHERE TITLE LIKE '%${word}%' OR CONTENT LIKE '%${word}%' OR SNAME LIKE '%${word}%'`;
        result = await con.execute(sql);
        let count = result.rows[0][0];

        res.send({list, count});
    }catch(err){
        console.log('게시글 목록 데이터', err.message);
    }finally{
        if(con) await con.close();
    }
});


//글쓰기 페이지 이동
router.get('/insert', function(req, res){
    res.render('index', {title:'글쓰기', pageName:'posts/insert.ejs'});
});

//게시글 등록
router.post('/insert', async function(req,res){
    const title=req.body.title;
    const content=req.body.content;
    const writer=req.body.writer;
    //console.log(title, content, writer);
    let con;
    try{
        con = await getConnection();
        let sql="insert into posts(title, content, writer) values(:title, :content, :writer)";
        await con.execute(sql, {title, content, writer}, {autoCommit:true});
    }catch(err){
        console.log('게시글 등록', err.message);
    }finally{
        if(con) await con.close();
    }
    res.sendStatus(200);
});

//게시글 정보 페이지
router.get('/:id', async function(req, res){
    const id = req.params.id;
    let con;
    try{
        con = await getConnection();
        let sql="select * from view_posts where id=:id";
        let result = await con.execute(sql, {id}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
        let post = result.rows[0]; 
        res.render('index', {title:'게시글 정보', pageName:'posts/read.ejs', post});

    }catch(err){
        console.log('게시글 정보', err.message);
    }finally{
        if(con) await con.close();
    }
});

router.post('/delete', async function(req, res){
    const id=req.body.id;
    let con;
    try{
        con = await getConnection();
        let sql ="delete from posts where id=:id";
        await con.execute(sql, {id}, {autoCommit:true});
        res.sendStatus(200);

    }catch(err){
        console.log('게시글 삭제', err.message);
        res.sendStatus(500);
    }finally{
        if(con) await con.close();
    }
});

 router.get("/update/:id", async function(req, res){
        const id=req.params.id;
        let con;
        try{
            con = await getConnection();
            let sql = "select * from view_posts where id=:id";
            let result = await con.execute(sql, {id}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
            let post = result.rows[0];
            res.render('index', {title:'게시글 수정', pageName:'posts/update.ejs', post});
        }catch(err){
            console.log('게시글 수정', err.message);
        }finally{
            if(con) await con.close();
        }

    });

    router.post('/update', async function(req, res){
    const id=req.body.id;
    const title=req.body.title;
    const content=req.body.content;
    console.log(id, title, content);
    try{
        con = await getConnection();
        let sql="update posts set title=:title, content=:content where id=:id";
        await con.execute(sql, {title, content, id}, {autoCommit:true});
        res.sendStatus(200);
    }catch(err){
        console.log('게시글 수정', err.message);
        res.sendStatus(500);
    }finally{
        if(con) await con.close();
    }
});

module.exports = router;