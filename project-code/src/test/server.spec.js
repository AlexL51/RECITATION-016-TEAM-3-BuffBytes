// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });


  // ===========================================================================
  // TO-DO: Part A Login unit test case

//Login tests
it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'collisteru', password:'colliPass'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });
});

it('negative : /login checking invalid password', done => {
  chai
    .request(server)
    .post('/login')
    .send({username: 'collisteru', password:'wrongPass'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      assert.strictEqual(res.body.message, 'Incorrect username or password.');
      done();
    }); 

 // Topic test
    it('positive : /publishPost', done => {
      chai
        .request(server)
        .post('/publishPost')
        .send({text: 'Hello, this is a test post'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equals('Post published.');
          done();
        });
    });
  });
  
  it('negative : /publishPost checking for null input', done => {
    chai
      .request(server)
      .post('/publishPost')
      .send({text: ''})
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert.strictEqual(res.body.message, 'Post is empty.');
        done();
      }); 

 // Comments test
      it('positive : /publishComment', done => {
        chai
          .request(server)
          .post('/publishComment')
          .send({postID: '123', text: 'This is a test comment'})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.message).to.equals('Comment published');
            done();
          });
      });
    });
    
    it('negative : /publishComment not valid/empty parent postID', done => {
      chai
        .request(server)
        .post('/')
        .send({postID: '', text:'This is a text comment'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          assert.strictEqual(res.body.message, 'No/invalid parent post ID');
          done();
        }); 

    
});
