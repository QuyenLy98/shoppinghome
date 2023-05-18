import React, { useContext, useEffect, useReducer, useState } from 'react';
import LoadingBox from '../../components/LoadingBox';
import MessageBox from '../../components/MessageBox';
import { Store } from '../../Store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getError } from '../../utils';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { toast } from 'react-toastify';

const changeDate = (data) => {
  const date = new Date(data);
  return (
    date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear()
  );
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default function AcceptOrder() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [check, setCheck] = useState(false);
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(
          `https://server-app-led2.onrender.com/api/orders/manageaccept`,

          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
    setCheck(false);
  }, [userInfo, check]);

  const handlerUpdate = async (id) => {
    try {
      await axios.put(
        `https://server-app-led2.onrender.com/api/orders/update/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success('Xác nhận thành công');
      setCheck(true);
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <h3 className="text-center">DANH SÁCH</h3>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : orders.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Mã giao dịch</th>
              <th>Ngày giao dịch</th>
              <th>Tổng</th>
              <th>Thanh toán</th>
              <th>Đã giao hàng</th>
              <th>Thông tin</th>
              <th>Xác nhận đơn hàng & xóa</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="text-secondary">{order._id}</td>
                <td className="text-secondary">
                  {changeDate(order.createdAt)}
                </td>
                <td className="text-primary">
                  {order.totalPrice.toFixed(2)} $
                </td>
                <td>
                  {order.isPaid ? (
                    <Badge pill bg="success">
                      Xong
                    </Badge>
                  ) : (
                    <Badge pill bg="info">
                      No
                    </Badge>
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    <Badge pill bg="success" onClick={() => {}}>
                      Xong
                    </Badge>
                  ) : !order.isDelivered && order.isPaid ? (
                    <Badge pill bg="warning" onClick={() => {}}>
                      Đang chờ
                    </Badge>
                  ) : (
                    <Badge pill bg="info">
                      No
                    </Badge>
                  )}
                </td>
                <td>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    <i className="fa-regular fa-circle-info"></i>
                  </Button>
                </td>
                <td>
                  {order.isDelivered && order.isPaid ? (
                    <Button
                      className="float-end"
                      type="button"
                      variant="danger"
                      onClick={() => {
                        axios.delete(
                          `https://server-app-led2.onrender.com/api/orders/delete/${order._id}`,
                          {
                            headers: {
                              Authorization: `Bearer ${userInfo.token}`,
                            },
                          }
                        );
                        toast.success('Xóa thành công');
                        setCheck(true);
                      }}
                    >
                      <i className="fa-solid fa-trash-check "></i>
                    </Button>
                  ) : !order.isDelivered && !order.isPaid ? (
                    ''
                  ) : (
                    <Button
                      className="ms-2"
                      type="submit"
                      variant="success"
                      onClick={() => handlerUpdate(order._id)}
                    >
                      Hoàn tất
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h3 className="text-secondary text-center">
          <i className="fa-solid fa-empty-set"></i>
        </h3>
      )}
    </div>
  );
}
