import { GRAIL_GALLERI_MULTI_CANCER_TEST } from '@/const';
import { useAuthorization } from '@/lib/authorization';
import { OrderStatus, RequestGroup } from '@/types/api';

export const useAppointmentManagement = ({
  requestGroup,
}: {
  requestGroup: RequestGroup;
}) => {
  const isPastAppointment = requestGroup.startTimestamp
    ? new Date(requestGroup.startTimestamp) < new Date()
    : false;

  const hasAppointmentType = requestGroup.appointmentType !== undefined;

  const isRevokedOrCompleted = [
    OrderStatus.revoked,
    OrderStatus.completed,
  ].includes(requestGroup.status);

  const { checkAdminActorAccess } = useAuthorization();
  const isAdminActor = checkAdminActorAccess();

  const canManage =
    !isPastAppointment && !isRevokedOrCompleted && hasAppointmentType;

  const isCancerAtHome =
    requestGroup.collectionMethod === 'AT_HOME' &&
    requestGroup.orders.some(
      (order) => order.serviceName === GRAIL_GALLERI_MULTI_CANCER_TEST,
    );

  const isWalkIn = requestGroup.appointmentType === 'UNSCHEDULED';

  const canReschedule = canManage && !isCancerAtHome && !isWalkIn;
  const canCancel = canManage || isAdminActor;

  return {
    canReschedule,
    canCancel,
  };
};
