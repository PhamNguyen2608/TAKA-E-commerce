import { Button, Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ADDRESS_API from '../../../api/address';
import { STATUS_OK } from '../../../constants/api';
import transportService from '../../../services/transport';
import { commonActions } from '../../../store/common';
import './style.scss';
const { Option } = Select;

const CreateAddressForm = ({ onCreateSuccess }) => {
  const [form] = Form.useForm();
  const { userInfo, addresses } = useSelector((state) => state.common);
  const dispatch = useDispatch();

  const [provinces, setProvinces] = useState();
  const [selectedProvince, setSelectedProvince] = useState();
  const [districts, setDistricts] = useState();
  const [selectedDistrict, setSelectedDistrict] = useState();
  const [wards, setWards] = useState();
  const [selectedWard, setSelectedWard] = useState();
  const [street, setStreet] = useState();

  const handleProvinceSelect = (value) => {
    setSelectedProvince(value);
  };

  const handleDistrictSelect = (value) => {
    setSelectedDistrict(value);
  };

  const handleWardSelect = (value) => {
    setSelectedWard(value);
  };

  const handleStreetChange = ({ target: { value } }) => {
    setStreet(value);
  };

  const handleSubmit = () => {
    const province = provinces.find(
      (item) => item.ProvinceID === selectedProvince
    );

    const district = districts.find(
      (item) => item.DistrictID === selectedDistrict
    );

    const ward = wards.find((item) => item.WardCode === selectedWard);
    const payload = {
      user: userInfo._id,

      province: {
        name: province?.ProvinceName,
        code: selectedProvince,
      },
      district: {
        name: district.DistrictName,
        code: selectedDistrict,
      },
      ward: {
        districtID: ward?.DistrictID,
        name: ward?.WardName,
        code: selectedWard,
        wardCode: ward?.WardCode,
      },
      street,
    };

    ADDRESS_API.createAddress(payload)
      .then((response) => {
        if (response.status === STATUS_OK) {
          dispatch(commonActions.setAddresses([...addresses, response.data]));
          onCreateSuccess && onCreateSuccess();
        } else throw new Error(response.message);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    transportService({
      url: '/province',
    })
      .then((response) => {
        setProvinces(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (selectedProvince)
      transportService({
        url: `/district?province_id=${selectedProvince}`,
      })
        .then((response) => {
          setDistricts(response.data);
        })
        .catch((error) => console.log(error));
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict)
      transportService({
        url: `/ward?district_id=${selectedDistrict}`,
      })
        .then((response) => {
          setWards(response.data);
        })
        .catch((error) => console.log(error));
  }, [selectedDistrict]);

  return (
    <Form
      form={form}
      colon={false}
      scrollToFirstError
      name="add_address"
      onFinish={handleSubmit}
      autoComplete="off"
      initialValues={{}}
      labelCol={{
        span: 6,
        style: {
          'text-align': 'left',
        },
      }}
    >
      <Form.Item
        label="T???nh/Th??nh Ph???"
        name="province"
        rules={[
          {
            required: true,
            message: '*B???t bu???c',
          },
        ]}
      >
        <Select placeholder="Ch???n T???nh/TP" onChange={handleProvinceSelect}>
          {provinces?.length > 0 &&
            provinces.map((item) => {
              return (
                <Option value={item.ProvinceID} key={item.ProvinceID}>
                  {item.ProvinceName}
                </Option>
              );
            })}
        </Select>
      </Form.Item>
      <Form.Item
        rules={[
          {
            required: true,
            message: '*B???t bu???c',
          },
        ]}
        label="Qu???n/Huy???n"
        name="district"
      >
        <Select placeholder="Ch???n Qu???n/Huy???n" onChange={handleDistrictSelect}>
          {districts?.map((item) => {
            return (
              <Option value={item.DistrictID} key={item.DistrictID}>
                {item.DistrictName}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item
        rules={[
          {
            required: true,
            message: '*B???t bu???c',
          },
        ]}
        label="Ph?????ng/X??"
        name="ward"
      >
        <Select placeholder="Ch???n Ph?????ng/X??" onChange={handleWardSelect}>
          {wards?.map((item) => {
            return (
              <Option value={item.WardCode} key={item.WardCode}>
                {item.WardName}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item
        rules={[
          {
            required: true,
            message: '*B???t bu???c',
          },
        ]}
        label="S??? nh??/T??n ???????ng"
        name="street"
      >
        <Input
          onChange={handleStreetChange}
          placeholder="Nh???p ?????a ch??? c??? th???"
        />
      </Form.Item>
      <Form.Item style={{ margin: '0' }}>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          style={{ display: 'flex', marginLeft: 'auto' }}
        >
          Th??m
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateAddressForm;
