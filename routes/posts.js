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

module.exports = router;