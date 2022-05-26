import { writeCookie, readCookie, deleteCookie } from './script-work__cookies.js';

document.addEventListener("DOMContentLoaded", function () {
   const requestUrl = 'https://jsonplaceholder.typicode.com/todos';

   let background = document.querySelector('.popup');
   let usersBtn = document.querySelector('.header .users'),
      userPopup = document.querySelector('.users__popup'),
      userPopopClose = userPopup.querySelector('.close'),
      userId = 1;

   let sorting = document.querySelector('.sorting'),
      sortingHeader = sorting.querySelector('.sorting__header'),
      sortingList = sorting.querySelector('.sorting__list'),
      sortingListItem = sortingList.querySelectorAll('.item'),
      sortingArr = [];

   let input = document.querySelector('.input__task input'),
      taskAddBtn = document.querySelector('.input__task .add__task');

   let list = document.querySelector('.list__task'),

      tasks,
      listItem,
      itemArr = [];


   // запрос наполучения изначальных данных
   function sendRequest(method, url) {
      return new Promise((resolve, rejact) => {
         const xhr = new XMLHttpRequest();

         xhr.open(method, url);

         xhr.responseType = 'json';

         xhr.onload = () => {
            if (xhr.status >= 400) {
               rejact(xhr.response)
            } else {
               resolve(xhr.response);
            }
         }

         xhr.onerror = () => {
            rejact(xhr.response);
         }

         xhr.send()
      })
   }

   // функция для добваления элементов на странице
   function createElement(userId, id, title, completed) {
      // если существует заглушка то убрать её
      if (document.querySelector('.plug') != undefined) {
         document.querySelector('.plug').remove()
      }

      // добавить элемент на странице
      listItem = `
            <div class="item" data-userId="${userId}}" data-id="${id}" data-title="${title}" data-completed="${completed}">
               <label>
                  <input type="checkbox">
                  <span class="checkbox"></span>
                  <p>${title}</p>
               </label>
               <span class="remove-btn"></span>
            </div>`
      list.insertAdjacentHTML("beforeend", listItem);

      // добавить элемент в массив
      itemArr.push({ userId: userId, id: id, title: title, completed: completed });

      writeCookie('task', JSON.stringify(itemArr), 30);

      input.value = '';
   }

   // создание элемента из массива
   function createElemFromAnArray(array) {
      array.forEach(elem => {
         listItem = `
         <div class="item" data-userId="${elem['userId']}" data-id="${elem['id']}" data-title="${elem['title']}" data-completed="${elem['completed']}">
            <label>
               <input type="checkbox" ${elem['completed'] == true ? 'checked' : ''}>
               <span class="checkbox"></span>
               <p>${elem['title']}</p>
            </label>
            <span class="remove-btn"></span>
         </div>`
         list.insertAdjacentHTML("beforeend", listItem)
      })
   }

   // функция для сортировки
   function sortingElem(elem) {
      tasks = list.querySelectorAll('.item');

      if (elem == 'all') {
         if (tasks.length != 0) {
            tasks.forEach(item => {
               item.classList.remove('hide')
            })
         }
      } else if (elem == 'completed') {
         if (tasks.length != 0) {
            tasks.forEach(item => {
               if (item.getAttribute('data-completed') == 'true') {
                  item.classList.remove('hide')
               } else {
                  item.classList.add('hide')
               }
            })
         }
      } else if (elem == 'in_work') {
         if (tasks.length != 0) {
            tasks.forEach(item => {
               if (item.getAttribute('data-completed') == 'false') {
                  item.classList.remove('hide')
               } else {
                  item.classList.add('hide')
               }
            })
         }
      }
   }


   document.addEventListener('click', (event) => {
      let target = event.target;

      // нажатия в попапе с пользователями
      function clickUsersPopup() {
         // открытие
         if (target == usersBtn) {
            background.classList.add('active')
            userPopup.classList.add('active')
         }

         // закрытие 
         if (target == userPopopClose && userPopup.classList.contains('active')) {
            userPopup.classList.remove('active')
            background.classList.remove('active')
         }

         // закрытие нажатием на пользователя
         if (target.closest('.user__item') && userPopup.classList.contains('active')) {
            userPopup.classList.remove('active')
            background.classList.remove('active')
         }
      }
      clickUsersPopup();

      // сортировка
      function clickSortin() {
         // нажатие на шапке списка
         if (target == sortingHeader) {
            sorting.classList.toggle('active')
         } else if (sorting.classList.contains('active')) {
            sorting.classList.remove('active')
         }

         // нажатие на элементах списка
         if (target.tagName == 'INPUT' && target.closest('.item') && target.closest('.sorting__list')) {
            sortingHeader.textContent = target.closest('.item').textContent
            writeCookie('sorting', target.closest('.item').getAttribute('data-value'), 30);

            sortingElem(target.closest('.item').getAttribute('data-value'))
         }
      }
      clickSortin()

      // список задач
      function clickListTask() {
         // нажатие на задачу
         if (target.tagName == 'INPUT' && target.closest('.item') && target.closest('.list__task')) {
            itemArr.forEach(elem => {
               if (target.closest('.item').getAttribute('data-id') == elem['id']) {
                  if (target.closest('.item').querySelector('input').checked) {
                     target.closest('.item').setAttribute('data-completed', true);
                     elem['completed'] = true;
                  } else {
                     target.closest('.item').setAttribute('data-completed', false);
                     elem['completed'] = false;
                  }
               }
            })
            writeCookie('task', JSON.stringify(itemArr), 30);
         }

         // удаление задачи
         if (target.closest('.remove-btn') && target.closest('.item') && target.closest('.list__task')) {
            // визуальное удаление элемента
            target.closest('.item').remove();

            // получение задач которые остались
            tasks = list.querySelectorAll('.item');

            // удаление элемента по которому произошел клик из массива
            itemArr.forEach(elem => {
               if (elem['id'] == target.closest('.item').getAttribute('data-id')) {

                  itemArr.splice((itemArr.indexOf(elem)), 1);

                  // изменить индекс задачи в списке на странице
                  tasks.forEach((item, index) => {
                     item.setAttribute('data-id', index + 1);
                  })

                  // изменение индексов задачи в массиве
                  itemArr.forEach((elem, index) => {
                     elem['id'] = index + 1
                  })
               }
            })

            // отображать заглушку если удаленны все задачи
            if (itemArr.length == 0) {
               listItem = `<p class="plug">У вас нет задач</p>`
               list.insertAdjacentHTML("beforeend", listItem)
            }

            writeCookie('task', JSON.stringify(itemArr), 30);
         }
      }
      clickListTask()

      // добавление здач на страницу
      function addTask() {
         // нажатие на кнопку добавить задачу
         if (target == taskAddBtn) {
            if (input.value != '') {
               // получение задач которые остались
               tasks = list.querySelectorAll('.item');
               createElement(userId, tasks.length + 1, input.value, false)
            }
         }

         // добваление задачи нажатием клавиши enter
         input.addEventListener('keydown', (e) => {
            if (e.keyCode == 13 && input.value != '') {
               // получение задач которые остались
               tasks = list.querySelectorAll('.item');
               createElement(userId, tasks.length + 1, input.value, false)
            }
         })
      }
      addTask();

   })


   // получение данных из cookies при перезагрузке страницы
   function loadTask() {
      if (readCookie('task') != undefined) {
         itemArr = JSON.parse(readCookie('task'));

         if (itemArr.length > 0) {
            createElemFromAnArray(itemArr);
         } else {
            listItem = `<p class="plug">У вас нет задач</p>`
            list.insertAdjacentHTML("beforeend", listItem)
         }
      } else {
         sendRequest('GET', requestUrl)
            .then(data => {
               for (let i = 0; i < 5; i++) {
                  const elem = data[i];
                  itemArr.push(elem);
               }
               createElemFromAnArray(itemArr);

               wri
            })
            .catch(err => console.log(err))
      }
   }
   function loadSorting() {
      if (readCookie('sorting') != undefined) {
         sortingListItem.forEach(item => {
            if (item.getAttribute('data-value') == readCookie('sorting')) {
               item.querySelector('input').checked = true;
               sortingHeader.textContent = item.textContent;
            }
         })
         sortingElem(readCookie('sorting'));
      } else {
         sortingListItem.forEach(item => {
            if (item.getAttribute('data-value') == 'all') {
               item.querySelector('input').checked = true;
               sortingHeader.textContent = item.textContent
            }
         })
      }
   }
   window.addEventListener("load", function load() {
      loadTask();
      loadSorting();
   })
})