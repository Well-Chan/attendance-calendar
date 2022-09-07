import { createApp } from 'vue';
import App from './App.vue';
import { store, key } from './store';
import router from './router';

import {
	ElCalendar,
} from 'element-plus';
import {
  Icon,
  Button,
  DropdownMenu,
  DropdownItem,
  Overlay,
  Popup,
  Field,
  Cell,
  Switch,
  Swipe,
  SwipeItem,
  DatePicker,
  Slider,
  Toast,
  Dialog,
  setToastDefaultOptions,
} from 'vant';
import 'vant/es/toast/style';
import 'vant/es/dialog/style';

const app = createApp(App);

app.use(store, key);
app.use(router);

app.use(ElCalendar);

app.use(Icon);
app.use(Button);
app.use(DropdownMenu);
app.use(DropdownItem);
app.use(Overlay);
app.use(Popup);
app.use(Field);
app.use(Cell);
app.use(Switch);
app.use(Swipe);
app.use(SwipeItem);
app.use(DatePicker);
app.use(Slider);
app.use(Toast);
app.use(Dialog);
setToastDefaultOptions('loading', {
  duration: 0,
  forbidClick: true,
  message: '',
});

app.mount('#app');


