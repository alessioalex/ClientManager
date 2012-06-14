define('ClientModelSpec', ['ClientModel'], function(Client) {

  describe('Client Model', function() {
    var fakeClient;

    before(function() {
      fakeClient = {
        name    : "Alex",
        email   : "example@example.com",
        company : "Info Corp",
        born    : new Date()
      };
    });

    it("should check for required fields", function() {
      var client = new Client({ name: 'Alex' });

      client.isValid().should.be.false;

      client.set({
        name    : 'Alex',
        email   : fakeClient.email,
        company : fakeClient.company,
        born    : new Date()
      });

      client.isValid().should.be.true;
    });

    // 2 <= name.length <= 100
    it("should check for valid name", function() {
      var client, badName, i;

      client = new Client({
        name    : 'A',
        email   : fakeClient.email,
        company : fakeClient.company,
        born    : fakeClient.born,
      });
      client.isValid().should.be.false;

      for (i = 1; i < 102; i++) {
        badName += 'A';
      }

      client.set('name', badName);
      client.isValid().should.be.false;

      client.set('name', fakeClient.name);
      client.isValid().should.be.true;

    });

    it("should check for valid email", function() {
      var client = new Client({
        name    : fakeClient.name,
        company : fakeClient.company,
        born    : fakeClient.born,
        email   : "example@example"
      });

      client.isValid().should.be.false;

      client.set('email', "example@example.com");

      client.isValid().should.be.true;
    });

    // 7 <= company.length <= 100
    it("should check for valid company", function() {
      var client, badName, i;

      client = new Client({
        name    : fakeClient.name,
        email   : fakeClient.email,
        company : "The Co",
        born    : fakeClient.born,
      });
      client.isValid().should.be.false;

      for (i = 1; i < 102; i++) {
        badName += 'A';
      }

      client.set('company', badName);
      client.isValid().should.be.false;

      client.set('company', fakeClient.company);
      client.isValid().should.be.true;

    });

  });

});
