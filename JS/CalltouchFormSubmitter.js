class CalltouchFormSubmitter {
  constructor( config ) {

    // ID сайта внутри ЛК Calltouch.
    this.siteID = config.siteId;

    // Идентификатор скрипта Calltouch.
    this.modID  = config.modId;
    
    // Режим отладки (в консоль выводится ответ сервера).
    this.debugMode = config.debug;

    // API-запрос.
    this.url = `https://api.calltouch.ru/calls-service/RestAPI/requests/${this.siteID}/register/`;

    this.defaultParams = {
      fio: '', phoneNumber: '', email: '', comment: '', subject: 'Без названия', tags: [], requestUrl: window.location.href, sessionId: null,
    };

    // Навешивание событий на формы.
    this._bindForms();
  }

  /**
   * Навешивание событий на формы.
   */
  _bindForms() {
    Faze.on( 'submit', '[data-calltouch-restapi-form]', (event, formNode) => {
      event.preventDefault();

      // Флаг, нужен дефолтный сабмит формы.
      const needSubmit = Boolean( formNode.getAttribute( 'data-calltouch-submit' ) && formNode.getAttribute( 'data-calltouch-submit' ) === 'true' );

      // Получить ID сессии.
      this.defaultParams.sessionId = window.ct('calltracking_params', this.modID).sessionId;

      // DOM элементы инпутов с параметрами.
      const inputNodes = formNode.querySelectorAll( '[data-calltouch-param]' );
      
      // Объект с параметрами.
      const data = {};

      // Записать параметры.
      for ( const inputNode of inputNodes ) {
        data[inputNode.name] = ( inputNode.getAttribute( 'data-value-from' ) != null ) ? ( formNode.elements[inputNode.dataset.valueFrom].value || '' ) : inputNode.value;
      }

      // Отправить данные в Calltouch.
      this._fetch( data );

      // Отправить форму, если надо.
      if ( needSubmit ) {
        formNode.submit();
      }
    });
  }

  /**
   * Отправить данные в Calltouch.
   * 
   * @param { object } data - объект с данными. Ключ - параметр, значение - значение.
   */
  async _fetch( data ) {
    const ctData = new URLSearchParams(Object.entries(Object.assign(this.defaultParams, data))).toString();

    let response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },

      body: ctData
    });

    // Режим отладки
    if ( this.debugMode ) {
      let result = await response.json();

      if (!result.errorCode) {
        console.log(`Успешная отправка данных в calltouch. Ответ сервера: `, result);
      }
      else {
        console.error(`Ошибка отправки данных в calltouch. Дословно: "${result.message}"`);
      }
    }
  }
}