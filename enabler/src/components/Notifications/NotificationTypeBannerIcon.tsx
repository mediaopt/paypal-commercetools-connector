import { FC, ReactElement } from "react";
import {
  CheckIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { NotificationType } from ".";

type NotificationTypeIconProps = {
  type: NotificationType;
};

const generalIconStyle = "h-6 w-6 text-white";

const notificationTypeIcons: Record<NotificationType, ReactElement> = {
  Info: <InformationCircleIcon className={generalIconStyle} />,
  Error: <NoSymbolIcon className={generalIconStyle} />,
  Warning: <ExclamationTriangleIcon className={generalIconStyle} />,
  Success: <CheckIcon className={generalIconStyle} />,
};

export const NotificationTypeIcon: FC<
  React.PropsWithChildren<NotificationTypeIconProps>
> = ({ type }: NotificationTypeIconProps) => notificationTypeIcons[type];
