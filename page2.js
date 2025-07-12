document.addEventListener('DOMContentLoaded', async () => {
    const placesContainer = document.getElementById('placesContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const provinceFiltersContainer = document.getElementById('provinceFilters');
    const categoryFiltersContainer = document.getElementById('categoryFilters');
    const noResultsMessage = document.getElementById('noResults');

    let allPlaces = [];
    let provinces = new Set();
    let categories = new Set();

    // لیست کامل فایل‌های JSON استانی شما
    const jsonFiles = [
        'data/alborz_places.json',
        'data/ardabil_places.json',
        'data/azar_gharbi_places.json', // باید ویژگی "province" را داشته باشد
        'data/azar_sharghi_places.json',
        'data/bushehr_places.json',
        'data/chaharmahal_places.json',
        'data/fars_places.json',
        'data/gilan_places.json',
        'data/golestan_places.json',
        'data/hamedan_places.json',
        'data/hormozgan_places.json',
        'data/ilam_places.json',
        'data/isfahan_places.json',
        'data/kerman_places.json',
        'data/kermanshah_places.json',
        'data/khorasan_jonubi_places.json',
        'data/khorasan_razavi_places.json',
        'data/khorasan_shomali_places.json',
        'data/khuzestan_places.json',
        'data/kohgiluyeh_places.json',
        'data/kurdistan_places.json',
        'data/lorestan_places.json',
        'data/markazi_places.json',
        'data/mazandaran_places.json',
        'data/qazvin_places.json',
        'data/qom_places.json',
        'data/semnan_places.json',
        'data/sistan_places.json',
        'data/tehran_places.json',
        'data/yazd_places.json',
        'data/zanjan_places.json',
        // اگر فایل JSON جداگانه‌ای برای مکان‌های مذهبی دارید، آن را اینجا اضافه کنید:
        // 'data/religious_places.json'
    ];

    async function loadAllPlaces() {
        try {
            const fetchPromises = jsonFiles.map(file => fetch(file).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for file: ${file}`);
                }
                return response.json();
            }));

            const results = await Promise.all(fetchPromises);

            results.forEach(data => {
                if (Array.isArray(data)) {
                    data.forEach(place => {
                        // **در این نسخه، ما مستقیماً از ویژگی 'province' موجود در JSON استفاده می‌کنیم.**
                        // **اگر 'province' در JSON نباشد، خطایی نمایش داده می‌شود و مقدار 'نامشخص' را می‌گیرد.**
                        if (!place.province) {
                            console.warn(`Place "${place.name}" (ID: ${place.id || 'N/A'}) in one of your JSON files is missing a 'province' property. Please ensure all your JSON entries have this property. Setting to 'نامشخص' for now.`);
                            place.province = 'نامشخص';
                        }
                        
                        allPlaces.push(place);
                        provinces.add(place.province);
                        categories.add(place.category);
                    });
                }
            });

            renderFilters();
            displayPlaces(allPlaces);
        } catch (error) {
            console.error('Error loading places data:', error);
            placesContainer.innerHTML = '<p style="text-align: center; color: red;">خطا در بارگذاری اطلاعات جاذبه‌ها. لطفا از مسیر صحیح فایل‌ها و ساختار صحیح JSON (با ویژگی province) اطمینان حاصل کنید.</p>';
            noResultsMessage.style.display = 'block';
        }
    }

    function renderFilters() {
        provinceFiltersContainer.innerHTML = '';
        provinces.forEach(province => {
            const checkboxId = `province-${province.replace(/\s/g, '-')}`;
            provinceFiltersContainer.innerHTML += `
                <label for="${checkboxId}">
                    <input type="checkbox" id="${checkboxId}" value="${province}" class="province-filter">
                    ${province}
                </label>
            `;
        });

        categoryFiltersContainer.innerHTML = '';
        categories.forEach(category => {
            const checkboxId = `category-${category.replace(/\s/g, '-')}`;
            categoryFiltersContainer.innerHTML += `
                <label for="${checkboxId}">
                    <input type="checkbox" id="${checkboxId}" value="${category}" class="category-filter">
                    ${category}
                </label>
            `;
        });

        document.querySelectorAll('.province-filter, .category-filter').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
    }

    function displayPlaces(placesToDisplay) {
        placesContainer.innerHTML = '';
        if (placesToDisplay.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        } else {
            noResultsMessage.style.display = 'none';
        }

        placesToDisplay.forEach(place => {
            const placeCard = `
                <div class="place-card">
                    <img src="${place.image || 'https://via.placeholder.com/150'}" alt="${place.name}">
                    <div class="place-card-body">
                        <h3>${place.name}</h3>
                        <p>${place.description}</p>
                        <span class="province">استان: ${place.province}</span>
                        <span class="category">دسته: ${place.category}</span>
                    </div>
                </div>
            `;
            placesContainer.innerHTML += placeCard;
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedProvinces = Array.from(document.querySelectorAll('.province-filter:checked')).map(cb => cb.value);
        const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);

        const filteredPlaces = allPlaces.filter(place => {
            const matchesSearch = place.name.toLowerCase().includes(searchTerm) ||
                                  place.description.toLowerCase().includes(searchTerm);

            const matchesProvince = selectedProvinces.length === 0 || selectedProvinces.includes(place.province);
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(place.category);

            return matchesSearch && matchesProvince && matchesCategory;
        });

        displayPlaces(filteredPlaces);
    }

    searchButton.addEventListener('click', applyFilters);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            applyFilters();
        } else {
            applyFilters();
        }
    });

    loadAllPlaces();
});
