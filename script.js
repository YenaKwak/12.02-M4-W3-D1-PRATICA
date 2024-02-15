// 부트스트랩 카드로 검색결과를 보여줘야함
// 폼에 검색어 입력 후 버튼과 엔터키를 이용해서 검색이 가능
// 검색어는 3자이상 입력해야함, 검색어와 API 검색결과가 부분적으로라도 일치하면 본문에 결과나타나야함

// 검색결과 카드에는 장바구니에 추가되는 버튼이 있어야함
//cartDropdown을 누르면 드롭다운으로 추가된 목록 책 제목이 보이게.
// 버튼 입력시 장바구니에 추가,  추가되면 카드 스타일을 변경하여 이미 추가되었음을 표시


// 추가:
// 사용자에게 장바구니에서 책을 삭제할 수 있는 기회 제공
// 장바구니를 비우는 버튼 만들기

document.addEventListener('DOMContentLoaded', function(){
    const booksContainer = document.getElementById('booksContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('SearchButton');
    const cartDropdown = document.querySelector('.dropdown-menu')
    const homeButton = document.getElementById('homeButton');
    let cartItems = [];
    
    
    
     // 검색 실행 공통 함수
     function forSearch() {
        const searchText = searchInput.value.trim();
        if (searchText.length === 0) { // 입력창이 비어있는 경우
          alert('Please write something');
          booksContainer.innerHTML = ''; // 이전 검색 결과 지우기
        } else if (searchText.length >= 3) { // 3글자 이상
          fetchBooks(searchText);
        } else {
          alert('Please enter at least 3 characters');
          booksContainer.innerHTML = ''; // 이전 검색 결과 지우기
        }
      }
    
      homeButton.addEventListener('click', function(event){
        booksContainer.innerHTML = '';
      });
       // 검색 버튼 클릭 이벤트
       searchButton.addEventListener('click', forSearch);
    
       // 입력창에서 엔터키 이벤트
       searchInput.addEventListener('keypress', function(e) {
         if (e.key === 'Enter') {
           e.preventDefault(); // 폼 제출 방지
           forSearch(); // 검색 실행
         }
       });
    
    function fetchBooks(value) {
        // fetch 호출 시 템플릿 리터럴 안에서 변수를 올바르게 사용하기 위해 백틱(`)을 사용해야 합니다.
        fetch(`https://striveschool-api.herokuapp.com/books?search=${value}`) // 'value' 변수를 쿼리 스트링에 포함
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(books => {
            // 입력된 검색어와 일치하는 책 제목만 필터링
            const filteredBooks = books.filter(book => 
                book.title.toLowerCase().includes(value.toLowerCase())
            );
    
            if (filteredBooks.length === 0) { // 필터링된 검색 결과가 없을 경우
                alert('No results were found.');
                booksContainer.innerHTML = '';
                return;
            }
            displayBooks(filteredBooks); // 필터링된 책 목록을 화면에 표시
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            alert('An error occurred while fetching the books.');
        });
    }
    


    function displayBooks(books) {
      booksContainer.innerHTML = '';
      books.forEach(book => {
          const bookElement = document.createElement('div');
          bookElement.className = 'col-xl-3 col-lg-6 col-md-6 col-sm-12 my-5';
          bookElement.innerHTML = `
          <div class="card my-3 mx-auto text-center" style="width: 18rem;">
            <img src="${book.img}" class="card-img-top" alt="${book.title}">
            <div class="card-body">
              <h6 class="card-title">${book.title}</h6>
              <p class="fw-bold card-text">$${book.price}</p>
              <div class="buttons">
              <button class="btn btn-dark addToCart" data-asin="${book.asin}">Add to cart</button>
              <button class="btn btn-dark skipButton">Skip</button>
              <a href="/details.html?id=${book.asin}" class="btn"><i class="fa-solid fa-circle-info"></i></a>
            </div>
              </div>
          </div>
        `;
          booksContainer.appendChild(bookElement);

          bookElement.querySelector('.skipButton').addEventListener('click', function(){
            bookElement.remove();
          });


              });
  






  
  
  
      
      // 'Add to cart' 버튼 이벤트 리스너 추가
      document.querySelectorAll('.addToCart').forEach(button => {
          button.addEventListener('click', function() {
              const bookAsin = this.dataset.asin;
              const book = books.find(b => b.asin === bookAsin);
              if (book){
              addToCart(book, this);
              }
          });
      });
  }
  
  function addToCart(book, button) {
      if (cartItems.find(item => item.asin === book.asin)) {
          alert('This book is already added to the cart.');
          return;
      }
      cartItems.push(book);
      updateCartDropdown();
  
      button.classList.remove('btn-dark');
      button.classList.add('btn-secondary');
  
  
    //버튼에 마우스 오버 이벤트 추가
    button.addEventListener('mouseleave', function(){
      button.classList.add('btn-danger');
      button.textContent = 'Added';
    });
  }
  
  
  function updateCartDropdown() {
    // 드롭다운 내용을 업데이트하는 새로운 HTML 생성
    cartDropdown.innerHTML = cartItems.map((item, index) => 
      `<button class="dropdown-item" type="button" data-asin="${item.asin}">${index + 1}. ${item.title}</button>`
    ).join('');
  
    // 각 드롭다운 아이템에 대한 클릭 이벤트 리스너 추가
    cartDropdown.querySelectorAll('.dropdown-item').forEach(itemButton => {
      itemButton.addEventListener('click', function() {
        const asin = this.dataset.asin;
        removeFromCart(asin);
        updateAddToCartButton(asin);
      });
    });
  }
  
  function removeFromCart(asin) {
    // 장바구니에서 아이템 제거
    cartItems = cartItems.filter(item => item.asin !== asin);
    updateCartDropdown(); // 드롭다운 메뉴 업데이트
  }
  
  function updateAddToCartButton(asin) {
    // 특정 ASIN에 해당하는 "Add to Cart" 버튼을 찾아 상태 업데이트
    const button = document.querySelector(`.addToCart[data-asin="${asin}"]`);
    if (button) {
      button.textContent = 'Add to Cart';
      button.classList.remove('btn-danger', 'btn-secondary', 'btn-warning');
      button.classList.add('btn-dark');
    }
  }
  
  });
  
  
  
  
  
  

  //상세정보 페이지로 이동 구현
const params = new URLSearchParams(window.location.search);
const asin = params.get("id");

fetch(`https://striveschool-api.herokuapp.com/books/${asin}`)
.then(response => {
    if (!response.ok) {
        throw new Error('Network response is incorrect.');
    }
    return response.json();
})
.then(book => {
    const detailsElement = document.getElementById('bookDetails');
    const detailsContainer = document.createElement('div'); 
    detailsContainer.innerHTML = `
    <div class="text-center my-5">
        <h5 class="fw-bold pb-3">Title : ${book.title}</h5>
        <img src="${book.img}" alt="${book.title}" style="width: 350px;">
        <h5 class="fw-bold mt-3">Category : ${book.category}</h5>
        <h5 class="fw-bold">Price : €${book.price}</h5>
        </div>
        `; 
        
    detailsElement.appendChild(detailsContainer);
})
.catch(error => {
    console.error('Fetch error:', error);
});


