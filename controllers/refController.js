const CarModel = require('../models/CarModel');
const CarBrand = require('../models/CarBrandModel');
const Region = require('../models/RegionModel');
const TariffModel = require('../models/tariffModel');
const Time = require('../models/timeModel');


exports.getCarBrands = async (req, res) => {
    /*  #swagger.tags = ['Ref']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {
        const car_brands = await CarBrand.findAll();

        data = car_brands.map((car) => {
            return {
                id: car.id,
                name: car.name1,
    
            };
        });


        res.status(200).json(data);
    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({ error: error.message });
    }
};


exports.getCarModels = async (req, res) => {
    /*  #swagger.tags = ['Ref']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {

        const brand_id = req.query.brand_id;

        const car_models = await CarModel.findAll({ where: { brand_id: brand_id } });

        data = car_models.map((car) => {
            return {
                id: car.id,
                name: car.name1,
    
            };
        });


        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRegions = async (req, res) => {
    /*  #swagger.tags = ['Ref']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {
        const regions = await Region.findAll({
            order: [['name1', 'ASC']], // `name1` ustuni bo‘yicha o‘sish tartibida tartiblash
        });

        data = regions.map((region) => {
            return {
                id: region.id,
                name: region.name1,
    
            };
        });

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getTarifss = async (req, res) => {
    /*  #swagger.tags = ['Ref']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {
        const tariff_plans = await TariffModel.findAll({
            order: [['id', 'ASC']], // `name1` ustuni bo‘yicha o‘sish tartibida tartiblash
        });

        data = tariff_plans.map((tariff) => {
            const formattedPrice = new Intl.NumberFormat('uz-UZ').format(tariff.price);

            return {
                id: tariff.id,
                name: tariff.name1,
                description: tariff.description,
                monthly: tariff.monthly,
                // tariff.price to 16 000 yoki 160 000 ko'rinishda bo'lishi kerak
                price: formattedPrice,
    
            };
        });

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getTimes = async (req, res) => {
    /*  #swagger.tags = ['Ref']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {
        const times = await Time.findAll({
            order: [['id', 'ASC']], // `name1` ustuni bo‘yicha o‘sish tartibida tartiblash
        });

        data = times.map((time) => {
            return {
                id: time.id,
                name: time.name1,
    
            };
        });

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}






