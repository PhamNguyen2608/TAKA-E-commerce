import { Image, InputNumber, notification, Rate } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CART_API from '../../../../api/cart';
import PRODUCT_API from '../../../../api/product';
import MySlick from '../../../../components/Slick';
import { STATUS_FAIL } from '../../../../constants/api';
import useAuthorization from '../../../../hooks/useAuthorization';
import { cartActions } from '../../../../store/cart';
import { formatNumber, getSalePrice } from '../../../../utils';
import './style.scss';
import { commonActions } from '../../../../store/common';
import { debounce } from 'lodash';
import { useCallback } from 'react';

const MainInfo = ({ data, avgStar }) => {
  const dispatch = useDispatch();
  const { checkRole, redirect } = useAuthorization();

  const { userInfo } = useSelector((state) => state.common);
  const { cartItems } = useSelector((state) => state.cart);

  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(data.thumbnail_url);
  const [imageList, setImageList] = useState([]);
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    (async function () {
      if (!data._id) return;
      try {
        setMainImage(data.thumbnail_url);
        const response = await PRODUCT_API.getProductImages(data._id);

        if (response.status === STATUS_FAIL)
          return console.log(response.message);

        setImageList(response.data?.map((item) => item.url));
      } catch (error) {
        console.log(error.message);
      }
    })();
  }, [data]);

  const changeImage = (newImage) => {
    setMainImage(newImage);
  };

  const handleSelectQty = (value) => {
    if (!value) {
      setDisable(true);
    }
    if (!Number.isInteger(value)) {
      setQuantity(1);
      return notification.warning({
        placement: 'topRight',
        message: 'Quantity Products',
        description: 'Product quantity is not decimal!',
        duration: 3,
      });
    }
    setDisable(false);
    if (value > data.stock) {
      notification.warning({
        message: 'Quantity Products',
        description: 'Larger product quantity in stock',
        duration: 3,
      });
    } else if (value < 1) {
      notification.warning({
        message: 'Quantity Products',
        description: 'Quantity cannot be less than 1',
        duration: 3,
      });
    }

    setQuantity(value);
  };

  const addToCart = async () => {
    if (!checkRole()) return dispatch(commonActions.toggleLoginForm(true));

    try {
      const oldItem = cartItems.find(
        (item) => data._id === (item.product._id || item.product)
      );
      let qty = quantity;

      if (oldItem?.quantity) qty += oldItem.quantity;

      if (qty > data.stock)
        return notification.error({
          placement: 'topRight',
          message: 'Can not add to cart!',
          description: 'Gi??? h??ng ???? v?????t qu?? s??? l?????ng s???n ph???m!',
          duration: 3,
        });

      const payloadData = {
        quantity: qty,
        user_id: userInfo._id,
        product_id: data._id,
      };

      const response = await CART_API.addToCart(payloadData);
      if (response.status === STATUS_FAIL)
        return notification.error({
          placement: 'topRight',
          message: 'Can not add to cart!',
          description: 'H??y nh???p s??? l?????ng s???n ph???m',
          description: response.message,
          duration: 3,
        });

      (!oldItem && dispatch(cartActions.addToCart(response.data))) ||
        dispatch(cartActions.updateCart(response.data));

      return notification.success({
        placement: 'topRight',
        message: 'Successfully!',
        description: response.message,
        duration: 3,
      });
    } catch (error) {
      return notification.error({
        placement: 'topRight',
        message: 'Can not add to cart!',
        description: error.message,
        duration: 3,
      });
    }
  };

  return (
    <div id="product__detail-main__info">
      <div className="main__info-container">
        <div className="image__library-wrapper">
          <div className="main__image">
            <Image width={'100%'} src={mainImage} />
          </div>
          <div className="image__list-container small-scroll">
            <div className="image__list">
              <MySlick xl={4} md={4} lg={4} sm={4} xxl={4}>
                {imageList.map((img) => (
                  <div
                    onClick={() => changeImage(img)}
                    className="image__list-item"
                  >
                    <img src={img} alt={'hello world'} />
                  </div>
                ))}
              </MySlick>
            </div>
          </div>
        </div>
        <div className="info-wrapper">
          <h1 className={`info-name ${data.stock < 1 && ' blur'}`}>
            {data.name}
            {data.stock < 1 && <span className="run__out">H???t h??ng</span>}
          </h1>
          <div className="info-rating">
            {avgStar || avgStar === 0 ? (
              <Rate allowHalf value={avgStar} disabled />
            ) : null}
            <span
              style={{
                marginLeft: 8,
                paddingLeft: 8,
                borderLeft: '1px solid var(--my-gray)',
              }}
            >
              ???? b??n: {data.sold || 0}
            </span>
          </div>
          <div className="info-price">
            {data.sale_percent > 0 ? (
              <>
                <span className="sale__price">
                  {formatNumber(getSalePrice(data.price, data.sale_percent))}???
                  <span>-{data.sale_percent}%</span>
                </span>
                <span className="price">{formatNumber(data.price)}???</span>
              </>
            ) : (
              <span className="sale__price">{formatNumber(data.price)}???</span>
            )}
            <div>
              <img
                style={{ height: 25, marginTop: 8 }}
                src="/svg/cheapest.png"
                alt="R??? h??n ho??n ti???n!"
              />
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}
            >
              <img
                style={{ height: 18, marginRight: 8 }}
                src="/svg/freeship.png"
                alt="Mi???n ph?? v???n chuy???n"
              />
              <span>Mi???n ph?? v???n chuy???n</span>
            </div>
          </div>
          <div className="info-field brand">
            <img src={data.brand?.image_url} alt={data.brand?.name} />
            <span
              style={{ transform: 'translateY(-4px)' }}
              className="info-value brand"
            >
              <Link to={data.brand?.slug}>{data.brand?.name}</Link>
            </span>
          </div>
          <div className="info-field origin">
            <span className="info-title origin">Xu???t x???:</span>
            <span className="info-value origin">{data.origin}</span>
          </div>
          <div className="info-field stock">
            <span className="info-title stock">Kho:</span>
            <span className="info-value stock">{data.stock}</span>
          </div>
          {data.insurance && (
            <div className="info-field insurance">
              <span className="info-title insurance">B???o h??nh:</span>
              <span className="info-value insurance">{data.insurance}</span>
            </div>
          )}
          <div className="product-action">
            <div className="quantity">
              <span>S??? l?????ng:</span>
              <div className="quantity-selector">
                <InputNumber
                  min={1}
                  defaultValue={1}
                  size="large"
                  onChange={handleSelectQty}
                />
              </div>
            </div>
            <div className="buy">
              <button
                disabled={data.stock < 1 || disable === true}
                onClick={addToCart}
                className="buy__btn"
              >
                Ch???n Mua
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainInfo;
