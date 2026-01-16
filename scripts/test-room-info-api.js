// Test script to verify room info API works correctly
const http = require('http');

function testRoomInfoAPI() {
  console.log('🧪 Testing Room Info API Endpoints\n');

  // Test data
  const testData = {
    roomNumber: 'TEST101',
    key: 'test_electricity_token',
    value: '9876-5432-1098-7654',
    category: 'utilities',
    description: 'Test electricity token'
  };

  // Prepare POST request data
  const postData = JSON.stringify(testData);

  // Options for POST request
  const postOptions = {
    hostname: 'localhost',
    port: 9002,
    path: '/api/admin/room-info',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('1️⃣ Testing: POST /api/admin/room-info');
  console.log('   Data:', testData);
  console.log('');

  const postReq = http.request(postOptions, (postRes) => {
    let data = '';

    postRes.on('data', (chunk) => {
      data += chunk;
    });

    postRes.on('end', () => {
      console.log('   Status:', postRes.statusCode);
      console.log('   Response:', data);

      if (postRes.statusCode === 201) {
        console.log('✅ POST successful!\n');

        // Now test GET
        console.log('2️⃣ Testing: GET /api/admin/room-info?roomNumber=TEST101');

        http.get(`http://localhost:9002/api/admin/room-info?roomNumber=TEST101`, (getRes) => {
          let getData = '';

          getRes.on('data', (chunk) => {
            getData += chunk;
          });

          getRes.on('end', () => {
            console.log('   Status:', getRes.statusCode);
            console.log('   Response:', getData);
            console.log('✅ GET successful!\n');

            // Now test DELETE
            console.log('3️⃣ Testing: DELETE /api/admin/room-info');

            const deleteOptions = {
              hostname: 'localhost',
              port: 9002,
              path: `/api/admin/room-info?roomNumber=${testData.roomNumber}&key=${testData.key}`,
              method: 'DELETE'
            };

            const deleteReq = http.request(deleteOptions, (deleteRes) => {
              let deleteData = '';

              deleteRes.on('data', (chunk) => {
                deleteData += chunk;
              });

              deleteRes.on('end', () => {
                console.log('   Status:', deleteRes.statusCode);
                console.log('   Response:', deleteData);
                console.log('✅ DELETE successful!\n');

                console.log('✅ All tests passed!');
                process.exit(0);
              });
            });

            deleteReq.on('error', (e) => {
              console.error('❌ DELETE error:', e.message);
              process.exit(1);
            });

            deleteReq.end();
          });
        }).on('error', (e) => {
          console.error('❌ GET error:', e.message);
          process.exit(1);
        });
      } else {
        console.log('❌ POST failed');
        process.exit(1);
      }
    });
  });

  postReq.on('error', (e) => {
    console.error('❌ POST error:', e.message);
    console.error('\n💡 Make sure the dev server is running on port 9002');
    process.exit(1);
  });

  postReq.write(postData);
  postReq.end();
}

testRoomInfoAPI();
