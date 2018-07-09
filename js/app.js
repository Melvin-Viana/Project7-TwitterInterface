const express = require('express');

const app = express();
app.set('view engine', 'pug');
app.use('/static', express.static('public'));
app.get('/',(req,res)=>{
    res.render('layout');
})

//Loads application on client server - localhost:3000
app.listen(3000, () => {
    console.log('The application is running on localhost:3000!')
});
