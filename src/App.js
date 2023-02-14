import { useState } from 'react';
import styles from './App.module.scss';
import Swiper from './components/swiper';
import './components/swiper/scss/swiper.scss';

function App() {
	Swiper({
		id: 'swiper',
		breakpoints: {
			0: { slidesPerView: 1 },
			992: { slidesPerView: 2 },
			1400: { slidesPerView: 3 },
			1920: { slidesPerView: 5 }
		}
	});

	const data = [
		{ id: 0, title: 'Menu 1' },
		{ id: 1, title: 'Menu 2' },
		{ id: 2, title: 'Menu 3' },
		{ id: 3, title: 'Menu 4' },
		{ id: 4, title: 'Menu 5' }
	];

	const [tabId, setTabId] = useState(0);

	return (
		<div style={{ padding: 100 }}>
			<div />
			<div
				className={`${styles.menu_container} itm-swiper-container`}
				id="swiper"
			>
				<div className={`itm-swiper-button-prev`} />
				<div className="itm-swiper">
					<div className={`${styles.menu} itm-swiper-wrapper`}>
						{data.map(item => (
							<div
								className={`${styles.menu_item}${
									item.id === tabId ? ` ${styles.is_selected}` : ''
								} itm-swiper-slide`}
								key={item.id}
								onClick={() => setTabId(item.id)}
							>
								{item.title}
							</div>
						))}
					</div>
				</div>
				<div className={`itm-swiper-button-next`} />
			</div>
		</div>
	);
}

export default App;
