const Stockx=()=>{
const options = {
    method: 'GET',
    headers: {
      'x-api-key':process.env.RETAIL_API_KEY
    }
  };
  const searchTerm = 'airjordan';
  const url = `https://app.retailed.io/api/v1/scraper/stockx/search?query=${encodeURIComponent(searchTerm)}`;
  
  fetch(url, options)
    .then(res => res.json())
    .then(data =>{
       console.log(data)
      return data
    })
    .catch(err =>{ console.error('Fetch error:', err)
      return null
    });
}
module.exports=Stockx